from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_secret_key: str = "change-me"
    app_cors_origins: list[str] = ["http://localhost:3000"]

    database_url: str = "postgresql+asyncpg://casegraph:casegraph@localhost:5432/casegraph"

    redis_url: str = "redis://localhost:6379/0"

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "casegraph"

    opensearch_url: str = "http://localhost:9200"

    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "casegraph-evidence"

    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    embedding_model: str = "text-embedding-3-small"


@lru_cache
def get_settings() -> Settings:
    return Settings()
