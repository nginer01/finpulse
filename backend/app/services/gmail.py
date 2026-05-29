"""
Gmail reader service — reads all emails from the dedicated FinPulse inbox.
Extracts full content from newsletters, newspapers, reports, etc.
"""

import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
from dataclasses import dataclass
from html.parser import HTMLParser

from app.core.config import settings


@dataclass
class EmailMessage:
    subject: str
    sender: str
    date: datetime
    body: str  # Full text content
    source_type: str  # newsletter, newspaper, report, unknown


class HTMLToText(HTMLParser):
    """Strip HTML tags and extract clean text."""
    def __init__(self):
        super().__init__()
        self.text = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "head"):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head"):
            self._skip = False
        if tag in ("p", "div", "br", "li", "h1", "h2", "h3", "h4", "tr"):
            self.text.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self.text.append(data)

    def get_text(self):
        return " ".join("".join(self.text).split())


def _html_to_text(html: str) -> str:
    parser = HTMLToText()
    parser.feed(html)
    return parser.get_text()


def _decode_subject(subject_header) -> str:
    if not subject_header:
        return "(sin asunto)"
    parts = decode_header(subject_header)
    decoded = []
    for part, charset in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(part)
    return " ".join(decoded)


def _classify_source(sender: str, subject: str) -> str:
    sender_lower = sender.lower()
    subject_lower = subject.lower()

    # Newsletters
    newsletter_senders = ["levine", "alphaville", "morning brew", "daily shot", "finimize", "seeking alpha", "motley"]
    if any(n in sender_lower for n in newsletter_senders):
        return "newsletter"

    # Podcasts / audio transcripts
    if any(p in sender_lower or p in subject_lower for p in ["podcast", "on-air", "transcript"]):
        return "podcast"

    # Bank reports
    bank_senders = ["bbva", "santander", "caixabank", "ubs", "goldman", "morgan stanley", "jp morgan", "citi", "barclays", "deutsche"]
    if any(b in sender_lower for b in bank_senders):
        return "report"

    # News / newspapers
    news_senders = ["financial times", "reuters", "bloomberg", "wsj", "economist", "expansion", "cinco dias", "el economista"]
    if any(n in sender_lower or n in subject_lower for n in news_senders):
        return "newspaper"

    # Polymarket / prediction markets
    if "polymarket" in sender_lower or "prediction" in sender_lower:
        return "polymarket"

    return "unknown"


def _extract_body(msg: email.message.Message) -> str:
    """Extract the best text content from an email message."""
    text_parts = []
    html_parts = []

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in disposition:
                continue
            try:
                payload = part.get_payload(decode=True)
                if not payload:
                    continue
                charset = part.get_content_charset() or "utf-8"
                decoded = payload.decode(charset, errors="replace")
                if content_type == "text/plain":
                    text_parts.append(decoded)
                elif content_type == "text/html":
                    html_parts.append(decoded)
            except Exception:
                continue
    else:
        content_type = msg.get_content_type()
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or "utf-8"
                decoded = payload.decode(charset, errors="replace")
                if content_type == "text/plain":
                    text_parts.append(decoded)
                elif content_type == "text/html":
                    html_parts.append(decoded)
        except Exception:
            pass

    # Prefer plain text, fallback to HTML converted to text
    if text_parts:
        return "\n\n".join(text_parts).strip()
    elif html_parts:
        return _html_to_text("\n".join(html_parts)).strip()
    return ""


def _parse_date(date_str: str | None) -> datetime:
    if not date_str:
        return datetime.now()
    try:
        parsed = email.utils.parsedate_to_datetime(date_str)
        return parsed.replace(tzinfo=None)
    except Exception:
        return datetime.now()


def fetch_emails(days_back: int = 1, max_emails: int = 50) -> list[EmailMessage]:
    """
    Fetch emails from the FinPulse Gmail inbox.
    Reads all emails from the last N days.
    """
    if not settings.gmail_address or not settings.gmail_app_password:
        return []

    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(settings.gmail_address, settings.gmail_app_password)
    mail.select("inbox")

    # Search for emails from the last N days
    since_date = (datetime.now() - timedelta(days=days_back)).strftime("%d-%b-%Y")
    status, message_ids = mail.search(None, f'(SINCE {since_date})')

    if status != "OK" or not message_ids[0]:
        mail.logout()
        return []

    ids = message_ids[0].split()
    # Take the most recent ones
    ids = ids[-max_emails:]

    emails = []
    for email_id in ids:
        try:
            status, msg_data = mail.fetch(email_id, "(RFC822)")
            if status != "OK":
                continue

            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            subject = _decode_subject(msg.get("Subject"))
            sender = msg.get("From", "")
            date = _parse_date(msg.get("Date"))
            body = _extract_body(msg)

            if not body or len(body) < 50:
                continue

            # Truncate very long emails (keep first 15000 chars)
            if len(body) > 15000:
                body = body[:15000] + "\n\n[... contenido truncado por longitud ...]"

            source_type = _classify_source(sender, subject)

            emails.append(EmailMessage(
                subject=subject,
                sender=sender,
                date=date,
                body=body,
                source_type=source_type,
            ))
        except Exception:
            continue

    mail.logout()
    return emails


def fetch_all_emails_text(days_back: int = 1) -> str:
    """
    Fetch all emails and return them as a single formatted text block
    ready to be passed to Claude for briefing generation.
    """
    emails = fetch_emails(days_back=days_back)

    if not emails:
        return "No hay emails nuevos en el inbox de FinPulse."

    parts = []
    parts.append(f"=== {len(emails)} EMAILS RECIBIDOS EN LAS ULTIMAS {days_back * 24}H ===\n")

    for i, em in enumerate(emails, 1):
        parts.append(f"--- EMAIL {i}/{len(emails)} ---")
        parts.append(f"Asunto: {em.subject}")
        parts.append(f"Remitente: {em.sender}")
        parts.append(f"Fecha: {em.date.strftime('%Y-%m-%d %H:%M')}")
        parts.append(f"Tipo: {em.source_type}")
        parts.append(f"Contenido:\n{em.body}")
        parts.append("")

    return "\n".join(parts)
