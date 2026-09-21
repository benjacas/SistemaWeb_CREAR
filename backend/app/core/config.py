from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    postgres_user: str = "crear"
    postgres_password: str = "cambiar_en_local"
    postgres_db: str = "crear_db"
    secret_key: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
