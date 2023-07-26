from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    success: bool = Field(..., example="True")
    errors: list = Field(..., example=['Something went wrong'])
    data: dict = Field(..., example={})
    message: str = Field(..., example="Your request was successful")

    def add_error(self, error):
        self.errors.append(error)


def success(data=None, message=None):
    return ApiResponse(success=True, errors=[], data=data if data else {}, message=message if message else '')


def failure(errors):
    if not isinstance(errors, list):
        errors = [str(errors)]
    return ApiResponse(success=False, errors=errors, data={}, message='')
