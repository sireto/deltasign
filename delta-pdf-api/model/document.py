from pydantic import BaseModel, Field


class DocumentPatchRequest(BaseModel):
    name: str = Field(..., example="PDF name")
