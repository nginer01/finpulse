"""
Revolut ingestion — detects buy/sell operations automatically.

Revolut has no public trading API, so operations arrive through two channels:
1. CSV export (account statement) uploaded by the user — already partially
   supported by /portfolio/import-csv; here we parse the full statement into
   Operation rows.
2. Order confirmation emails forwarded/received in the dedicated FinPulse
   Gmail inbox — parsed with regexes covering the EN and ES templates.

Each parsed trade gets a deterministic external_id (hash of its identifying
fields) so re-importing the same CSV or re-reading the same email never
duplicates operations.
"""

import hashlib
import re
import csv
import io
from dataclasses import dataclass
from datetime import datetime, date


@dataclass
class ParsedTrade:
    ticker: str
    operation_type: str  # buy / sell
    quantity: float
    price: float
    date: date
    source: str  # csv / email
    external_id: str


def _make_external_id(ticker: str, op_type: str, quantity: float, price: float, d: date) -> str:
    raw = f"revolut|{ticker.upper()}|{op_type}|{quantity:.8f}|{price:.4f}|{d.isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def _clean_number(value: str) -> float:
    """'$1,234.56' / '1.234,56 €' / '12.5' → float."""
    if not value:
        return 0.0
    v = re.sub(r"[^\d.,\-]", "", value.strip())
    if not v:
        return 0.0
    # If both separators present, the last one is the decimal separator
    if "," in v and "." in v:
        if v.rfind(",") > v.rfind("."):
            v = v.replace(".", "").replace(",", ".")
        else:
            v = v.replace(",", "")
    elif "," in v:
        # Single comma: decimal if followed by 1-2 digits at the end
        if re.search(r",\d{1,2}$", v):
            v = v.replace(",", ".")
        else:
            v = v.replace(",", "")
    try:
        return float(v)
    except ValueError:
        return 0.0


def _parse_date(value: str) -> date | None:
    value = (value or "").strip()
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d/%m/%Y",
        "%d %b %Y", "%d %B %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


# ── CSV statement ──

# Revolut trading statement types that represent actual trades
_CSV_BUY_TYPES = {"BUY - MARKET", "BUY - LIMIT", "BUY - STOP", "BUY"}
_CSV_SELL_TYPES = {"SELL - MARKET", "SELL - LIMIT", "SELL - STOP", "SELL"}


def parse_csv(text: str) -> list[ParsedTrade]:
    """Parse a Revolut trading account statement CSV into trades."""
    reader = csv.DictReader(io.StringIO(text))
    trades: list[ParsedTrade] = []

    for row in reader:
        # Normalize keys (Revolut headers vary slightly between exports)
        norm = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}

        ticker = norm.get("ticker") or norm.get("symbol") or ""
        raw_type = (norm.get("type") or "").upper()
        qty = _clean_number(norm.get("quantity", ""))
        price = _clean_number(norm.get("price per share") or norm.get("price", ""))
        d = _parse_date(norm.get("date", ""))

        if raw_type in _CSV_BUY_TYPES or raw_type in ("COMPRA",):
            op_type = "buy"
        elif raw_type in _CSV_SELL_TYPES or raw_type in ("VENTA",):
            op_type = "sell"
        else:
            continue  # dividends, top-ups, fees, splits...

        if not ticker or qty <= 0 or price <= 0 or d is None:
            continue

        trades.append(ParsedTrade(
            ticker=ticker.upper(),
            operation_type=op_type,
            quantity=qty,
            price=price,
            date=d,
            source="csv",
            external_id=_make_external_id(ticker, op_type, qty, price, d),
        ))

    return trades


# ── Order confirmation emails ──

_REVOLUT_SENDERS = ("revolut", "no-reply@revolut")

# EN: "Your order to buy 2.5 AAPL was executed at $189.95"
#     "Your market order to sell 10 TSLA has been filled at $242.10"
# ES: "Tu orden de compra de 2,5 AAPL se ha ejecutado a 189,95 US$"
#     "Se ha ejecutado tu orden de venta de 10 TSLA a 242,10 US$"
_EMAIL_PATTERNS = [
    re.compile(
        r"order to (?P<type>buy|sell)\s+(?P<qty>[\d.,]+)\s+(?:shares? of\s+)?(?P<ticker>[A-Z][A-Z0-9.]{0,9})\b"
        r".{0,120}?(?:executed|filled)\s+at\s+[^\d]{0,3}(?P<price>\d[\d.,]*\d|\d)",
        re.IGNORECASE | re.DOTALL,
    ),
    re.compile(
        r"orden de (?P<type>compra|venta)\s+de\s+(?P<qty>[\d.,]+)\s+(?:acciones de\s+)?(?P<ticker>[A-Z][A-Z0-9.]{0,9})\b"
        r".{0,120}?ejecutad[oa]\s+a\s+[^\d]{0,3}(?P<price>\d[\d.,]*\d|\d)",
        re.IGNORECASE | re.DOTALL,
    ),
]

_TYPE_MAP = {"buy": "buy", "sell": "sell", "compra": "buy", "venta": "sell"}


def is_revolut_email(sender: str, subject: str) -> bool:
    s = (sender or "").lower()
    subj = (subject or "").lower()
    if any(r in s for r in _REVOLUT_SENDERS):
        return True
    return "revolut" in subj and ("order" in subj or "orden" in subj)


def parse_confirmation_email(subject: str, body: str, email_date: datetime) -> ParsedTrade | None:
    """Extract a trade from a Revolut order-confirmation email, if present."""
    text = f"{subject}\n{body}"
    for pattern in _EMAIL_PATTERNS:
        m = pattern.search(text)
        if not m:
            continue
        op_type = _TYPE_MAP.get(m.group("type").lower())
        qty = _clean_number(m.group("qty"))
        price = _clean_number(m.group("price"))
        ticker = m.group("ticker").upper()
        if not op_type or qty <= 0 or price <= 0:
            continue
        d = email_date.date()
        return ParsedTrade(
            ticker=ticker,
            operation_type=op_type,
            quantity=qty,
            price=price,
            date=d,
            source="email",
            external_id=_make_external_id(ticker, op_type, qty, price, d),
        )
    return None
