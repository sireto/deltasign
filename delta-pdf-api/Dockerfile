FROM python:3.8
RUN apt-get update && \
    apt-get install -y swig && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

    
# We create home folder for non-root user.
RUN useradd -u 1001 -U  -d /server -m  app
WORKDIR /server
ENV PATH="$PATH:/server/.local/bin"
USER app

COPY ./requirements.txt ./requirements.txt

# install all the packages with cache disabled. (this layer will be cached unless requirements.txt is changed.)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the code
COPY ./ ./

EXPOSE 8000
CMD [ "uvicorn", "--proxy-headers", "--forwarded-allow-ips=*", "main:app", "--host", "0.0.0.0", "--port", "8000" ]
