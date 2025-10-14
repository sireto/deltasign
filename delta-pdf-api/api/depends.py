import base64
from urllib.request import urlopen

import facebook
from fastapi import HTTPException, Header , Cookie
from jose import jwt, JWTError
from pony.orm import db_session, ObjectNotFound
from starlette.status import HTTP_403_FORBIDDEN

from db import User
from env import JWT_SECRET_KEY, JWT_ALGORITHM, DEPLOYMENT
from dto.users import FacebookUser


# Users #############################################################################
from services import user_service


async def get_facebook_user(x_fb_access_token: str = Header(...)):
    try:
        graph = facebook.GraphAPI(access_token=x_fb_access_token, version="2.12")
        result = graph.get_object(id='/me', fields='id, name, last_name, first_name, picture, email')
        photo_data = result['picture']['data']['url']
        return FacebookUser(result['id'], result['name'], photo=photo_data)
    except facebook.GraphAPIError:
        raise HTTPException(status_code=400, detail="Invalid access token")


async def _get_logged_user(x_auth_token: str = Header(...), admin=False):
    credentials_exception = HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(x_auth_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # user_id = 1
    with db_session:
        try:
            user = User[int(user_id)]
            if admin and not user.admin:
                raise credentials_exception
            return user
        except ObjectNotFound:
            raise credentials_exception


# async def get_logged_user(x_auth_token: str = Header(...)):
#     return await _get_logged_user(x_auth_token, admin=False)


# async def get_admin_user(x_auth_token: str = Header(...)):
#     return await _get_logged_user(x_auth_token, admin=True)

async def get_logged_user(
    api_key: str = Header(None),                  
    access_token: str = Cookie(None)              
):
    if not api_key and access_token:
        api_key = access_token

    if not api_key:
        print(api_key , access_token)
        raise HTTPException(status_code=403, detail="API key missing")

    if DEPLOYMENT == "TEST" and api_key.startswith("test"):
        return user_service.create_new_account(f"{api_key}@deltasign.io")

    print("API KEY:", api_key)
    user = user_service.get_user_by_api_key(api_key)
    if user:
        return user

    raise HTTPException(status_code=403, detail="Invalid API key")