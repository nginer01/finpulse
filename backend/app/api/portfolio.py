from datetime import date
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import csv
import io

from app.core.database import get_db
from app.models.models import Position, Operation

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# ── Schemas ──

class PositionCreate(BaseModel):
    ticker: str
    name: str
    quantity: float
    buy_price: float
    buy_date: date | None = None
    broker: str = "Revolut"


class PositionOut(BaseModel):
    id: int
    ticker: str
    name: str
    quantity: float
    buy_price: float
    buy_date: date | None
    broker: str
    is_active: bool

    model_config = {"from_attributes": True}


class OperationOut(BaseModel):
    id: int
    ticker: str
    operation_type: str
    quantity: float
    price: float
    date: date
    broker: str

    model_config = {"from_attributes": True}


# ── Endpoints ──

@router.get("/positions", response_model=list[PositionOut])
async def get_positions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Position).where(Position.is_active == True).order_by(Position.created_at.desc())
    )
    return result.scalars().all()


@router.post("/positions", response_model=PositionOut)
async def create_position(data: PositionCreate, db: AsyncSession = Depends(get_db)):
    position = Position(
        user_id=1,  # TODO: get from auth
        ticker=data.ticker.upper(),
        name=data.name,
        quantity=data.quantity,
        buy_price=data.buy_price,
        buy_date=data.buy_date,
        broker=data.broker,
    )
    db.add(position)
    await db.commit()
    await db.refresh(position)
    return position


@router.delete("/positions/{position_id}")
async def delete_position(position_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Position).where(Position.id == position_id))
    position = result.scalar_one_or_none()
    if position:
        position.is_active = False
        await db.commit()
    return {"ok": True}


@router.post("/import-csv")
async def import_csv(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    imported = []
    for row in reader:
        # Try Revolut format
        ticker = row.get("Ticker", row.get("ticker", ""))
        qty = row.get("Quantity", row.get("quantity", "0"))
        price = row.get("Price per share", row.get("price", "0"))
        op_date = row.get("Date", row.get("date", ""))
        op_type = row.get("Type", row.get("type", "buy")).lower()

        if not ticker or float(qty or 0) <= 0:
            continue

        if op_type in ("buy", "compra"):
            position = Position(
                user_id=1,
                ticker=ticker.upper(),
                name=ticker.upper(),
                quantity=float(qty),
                buy_price=float(price),
                broker="Revolut",
            )
            db.add(position)
            imported.append(ticker.upper())

    await db.commit()
    return {"imported": len(imported), "tickers": imported}


@router.get("/operations", response_model=list[OperationOut])
async def get_operations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Operation).order_by(Operation.date.desc()).limit(20)
    )
    return result.scalars().all()
