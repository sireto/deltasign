from fastapi import APIRouter

demo_api = APIRouter()

@demo_api.get("/hello/{name}")
def say_hello(name: str):
    return f"Hello {name}"