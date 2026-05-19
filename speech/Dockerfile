FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


RUN wget https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip \
    && unzip vosk-model-small-cn-0.22.zip \
    && mv vosk-model-small-cn-0.22 model \
    && rm vosk-model-small-cn-0.22.zip


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000


CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]