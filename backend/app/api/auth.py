from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

SUPABASE_AUTH = f"{settings.supabase_url.strip()}/auth/v1"
HEADERS = {"apikey": settings.supabase_anon_key.strip(), "Content-Type": "application/json"}


# ── Schemas ──

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: int
    name: str
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    experience_level: str
    timezone: str


# ── Auth dependency ──

async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract user from Supabase JWT Bearer token."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization

    # Verify token by calling Supabase — this also handles expiry
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_AUTH}/user",
            headers={**HEADERS, "Authorization": f"Bearer {token}"},
        )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Token invalido o expirado")

    supabase_id = res.json().get("id")
    if not supabase_id:
        raise HTTPException(status_code=401, detail="Token invalido")

    result = await db.execute(select(User).where(User.supabase_id == supabase_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# ── Register ──

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists in our DB
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con este email")

    # Register in Supabase Auth
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_AUTH}/signup",
            headers=HEADERS,
            json={"email": body.email, "password": body.password},
        )

    if res.status_code == 422:
        raise HTTPException(status_code=400, detail="Contrasena demasiado debil (minimo 6 caracteres)")
    if res.status_code != 200:
        detail = res.json().get("msg", res.json().get("error_description", "Error al registrar"))
        raise HTTPException(status_code=res.status_code, detail=detail)

    data = res.json()
    # Supabase returns user at top level (no session) or inside data.user (with session)
    supabase_id = data.get("id") or data.get("user", {}).get("id")

    if not supabase_id:
        # Check if user already exists in Supabase Auth (email taken)
        if data.get("identities") is not None and len(data.get("identities", [])) == 0:
            raise HTTPException(status_code=409, detail="Ya existe una cuenta con este email")
        raise HTTPException(status_code=500, detail="Error inesperado de Supabase Auth")

    # Create user in our DB
    user = User(
        name=body.name,
        email=body.email,
        supabase_id=supabase_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # If Supabase returns session (email confirmation disabled)
    session = data.get("session")
    if session:
        return AuthResponse(
            access_token=session["access_token"],
            refresh_token=session["refresh_token"],
            user_id=user.id,
            name=user.name,
            email=user.email,
        )

    # If email confirmation is enabled, auto-login
    async with httpx.AsyncClient() as client:
        login_res = await client.post(
            f"{SUPABASE_AUTH}/token?grant_type=password",
            headers=HEADERS,
            json={"email": body.email, "password": body.password},
        )

    if login_res.status_code != 200:
        # User created but needs email confirmation
        raise HTTPException(status_code=201, detail="Cuenta creada. Confirma tu email para iniciar sesion.")

    login_data = login_res.json()
    return AuthResponse(
        access_token=login_data["access_token"],
        refresh_token=login_data["refresh_token"],
        user_id=user.id,
        name=user.name,
        email=user.email,
    )


# ── Login ──

@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{SUPABASE_AUTH}/token?grant_type=password",
                headers=HEADERS,
                json={"email": body.email, "password": body.password},
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase connection error: {str(e)}")

    if res.status_code == 400:
        raise HTTPException(status_code=401, detail="Email o contrasena incorrectos")
    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=f"Auth error: {res.status_code} {res.text}")

    data = res.json()
    supabase_id = data.get("user", {}).get("id")

    # Find user in our DB
    result = await db.execute(select(User).where(User.supabase_id == supabase_id))
    user = result.scalar_one_or_none()

    if not user:
        # User exists in Supabase Auth but not in our DB (edge case)
        # Create the user record
        user = User(
            name=body.email.split("@")[0],
            email=body.email,
            supabase_id=supabase_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return AuthResponse(
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        user_id=user.id,
        name=user.name,
        email=user.email,
    )


# ── Get current user ──

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        experience_level=user.experience_level,
        timezone=user.timezone,
    )


# ── Refresh token ──

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_AUTH}/token?grant_type=refresh_token",
            headers=HEADERS,
            json={"refresh_token": refresh_token},
        )

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Refresh token invalido")

    data = res.json()
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
    }
