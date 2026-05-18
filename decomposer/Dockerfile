FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir flask flask-cors hanzi_chaizi

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]