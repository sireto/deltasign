from fastapi import APIRouter, Depends
from pony.orm import db_session

from api.base import success
from api.depends import get_logged_user
from api.exceptions import UnauthorizedError, BadRequest
from db import User
from services import user_service, contract_service

users_api = APIRouter()
"""
GET     /users
GET     /users/:uuid
GET     /users/login 
POST    /users/login
DELETE  /users/:uuid
"""


@users_api.get("/users", tags=["User API"])
async def get_users():
    with db_session:
        users = user_service.get_users()
        data = {"users": [user.json() for user in users]}
        return success(data=data)


@users_api.get("/users/login", tags=["User API"])
async def email_login_code(email: str):
    """
    Emails the login code to the given email address.
    :param email: User email address
    :return: Login code
    """
    with db_session:
        user_service.email_login_code(email)
        return success(message="Login code has been sent to your email address.")


@users_api.post("/users/login", tags=["User API"])
async def login_with_code(email: str, login_code: str):
    """
    Log user in if successful and send the API key.
    :param email: User email address
    :param login_code: Login code sent to the email address
    :return: API Key
    """
    with db_session:
        if user_service.verify_login_code(email, login_code):
            user = user_service.get_user_by_email(email)
            return user.json(api_key=True)
        raise UnauthorizedError("Invalid email or login code")


@users_api.get("/users/me", tags=["User API"])
async def get_user(user: User = Depends(get_logged_user)):
    return user.json()


@users_api.get("/users/{uuid}", tags=["User API"])
async def get_user_by_uuid(uuid: str):
    with db_session:
        user = user_service.get_user_by_uuid(uuid)
        if user:
            return user.json()
        raise BadRequest("User does not exist")


@users_api.delete("/users", tags=["User API"])
async def delete_user(user: User = Depends(get_logged_user)):
    with db_session:
        user_service.delete_user_by_uuid(user.uuid)


@users_api.get("/users/{uuid}/contracts", tags=["User API"])
async def get_user_contracts(uuid: str, user: User = Depends(get_logged_user), sent: bool = True,
                             received: bool = False):
    with db_session:
        return [c.json() for c in contract_service.get_user_contracts(user, sent, received)]
