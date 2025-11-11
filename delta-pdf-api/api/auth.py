from datetime import timedelta

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from pony.orm import db_session
from starlette.responses import JSONResponse

from api.base import success
from api.depends import get_facebook_user, get_logged_user
# from auth.utils import create_access_token
from env import JWT_ACCESS_TOKEN_EXPIRE_MINUTES
from dto import FacebookUser
from entities import User

router = APIRouter()
"""
GET     /auth/facebook
GET     /auth/user
"""

@router.post("/auth/facebook", tags=["Auth API"])
async def facebook_callback(fb_user: FacebookUser = Depends(get_facebook_user)):
    # Get user based on facebook id if exists otherwise create an account
    with db_session:
        db_user = User.create_fb_user(fb_user)

    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )

    token = jsonable_encoder(access_token)
    response = JSONResponse({"access_token": token, "token_type": "bearer"})
    return response


@router.get("/auth/user", tags=["Auth API"])
async def auth_user(user: User = Depends(get_logged_user)):
    return success(data=user.to_dict())
