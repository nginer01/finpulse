from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FinPulse API"
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/finpulse"
    anthropic_api_key: str = ""
    gmail_address: str = ""
    gmail_app_password: str = ""
    cors_origins: list[str] = ["http://localhost:3000"]
    supabase_url: str = ""
    supabase_anon_key: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
