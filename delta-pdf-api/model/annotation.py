from typing import List

from pydantic import BaseModel, Field


class Annotation(BaseModel):
    x1: float = Field(..., example=10)
    x2: float = Field(..., example=110)
    y1: float = Field(..., example=10)
    y2: float = Field(..., example=30)
    signer: str = Field(..., example="testuser1@deltasign.io")
    page: int = Field(..., example=1)
    color: str = Field(..., example="#FFCCDD")


class ContractCreationRequest(BaseModel):
    name: str = Field(..., example="Contract01")
    document_uuid: str = Field(..., example="6a2d4174-80e2-48fa-bf2b-483cc53d0c7f")
    message: str = Field(..., example="Please review the contract and sign.")
    signers: List[str] = Field(..., example=["testuser1@deltasign.io", "testuser2@deltasign.io"])
    annotations: List[Annotation] = Field(...)


class ContractPatchRequest(BaseModel):
    name: str = Field(..., example="Contract01")
