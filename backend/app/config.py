from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"  # silently ignore unrecognised vars (e.g. SUPABASE_DB_PASSWORD)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
