from fastapi import APIRouter
from pydantic import BaseModel, Field
from starlette.requests import Request
from starlette.templating import Jinja2Templates

from services.email_service import EmailService

web_api = APIRouter()
templates = Jinja2Templates(directory="web/templates/")
"""
GET     /landing
GET     /privacy_policy
GET     /terms_conditions
"""


# @web_api.get("/")
# def form_post(request: Request):
#     return templates.TemplateResponse('landing.html', context={'request': request})


@web_api.get("/privacy_policy")
def form_post(request: Request):
    return templates.TemplateResponse('privacy_policy.html', context={'request': request})


@web_api.get("/terms_conditions")
def form_post(request: Request):
    return templates.TemplateResponse('terms_conditions.html', context={'request': request})


class BetaRequest(BaseModel):
    email: str = Field(..., example="hello@example.com")
    recaptchaResponse: str = Field(...)


@web_api.post("/beta-program")
def form_post(beta_request: BetaRequest, request: Request):
    email_service = EmailService()
    email_service.email_notification_of_beta_application(beta_request.email)
    return beta_request

