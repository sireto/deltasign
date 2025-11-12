import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

# Load all environment variables from .env uploaded_file
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

from api.contracts import contracts_api
from api.document import doc_api
from api.users import users_api
from api.web import web_api
from api.demo import demo_api
from common.util import env_to_list

load_dotenv()

SERVER_HOST = os.environ.get('SERVER_HOST', 'localhost')
SERVER_PORT = int(os.environ.get('SERVER_PORT', '50051'))

app = FastAPI(docs_url="/api/docs")
app.include_router(doc_api , prefix="/api")
app.include_router(users_api , prefix="/api")
app.include_router(contracts_api , prefix="/api")
# app.include_router(web_api)
app.include_router(demo_api , prefix="/api")

ALLOWED_ORIGINS = env_to_list(os.environ.get('ALLOWED_ORIGINS', "http://localhost:3000"))
ALLOWED_METHODS = env_to_list(os.environ.get('ALLOWED_METHODS', '*'))
ALLOWED_HEADERS = env_to_list(os.environ.get('ALLOWED_HEADERS', '*'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
)

print("allowed orgins : " , ALLOWED_ORIGINS)

# Public assets
app.mount("/static", StaticFiles(directory="web/static"), name="static")


# @app.get(
#     "/",
#     tags=["default"],
#     summary='Not an API. Simply redirects to /docs endpoint.'
# )
# async def read_main():
#     return RedirectResponse(url='/docs')


# Open API /docs or /redoc page customization
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Delta Contracts API",
        version="1.0.0",
        description="Open API spec of Delta Contracts",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://s3.eu-central-1.wasabisys.com/eu.delta.sireto.io/assets/images/logo.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.on_event("startup")
async def startup():
    print("app started")

@app.on_event("shutdown")
async def shutdown():
    print("app is shutting down")

if __name__ == "__main__":
    # setup_logging()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
