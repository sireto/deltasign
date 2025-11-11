from typing import Optional
from pydantic_settings import BaseSettings

class APISettings(BaseSettings):
    APP_ENV: str = "production"
    SECURE: Optional[bool] = None
    SAME_SITE: str = "None"

    def __init__(self, **values):
        super().__init__(**values)
        self.SECURE = True if self.APP_ENV == "production" else False
        self.SAME_SITE = "None" if self.APP_ENV == "production" else "lax"


