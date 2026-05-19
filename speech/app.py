import json
import vosk
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

model = vosk.Model("model")
SAMPLE_RATE = 16000

app = FastAPI()

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    rec = vosk.KaldiRecognizer(model, SAMPLE_RATE)
    
    try:
        while True:
            data = await websocket.receive_bytes()
            
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                if result.get("text"):
                    await websocket.send_json({"type": "final", "text": result["text"]})
            else:
                partial = json.loads(rec.PartialResult())
                if partial.get("partial"):
                    await websocket.send_json({"type": "partial", "text": partial["partial"]})
                    
    except WebSocketDisconnect:
        print("Client disconnected")