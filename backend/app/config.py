from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = {"env_file": ".env"}


settings = Settings()
