FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

COPY . /app
COPY ./requirements.txt /app/requirements.txt
RUN apt update && apt install -y swig

WORKDIR /app
RUN  pip3 install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
