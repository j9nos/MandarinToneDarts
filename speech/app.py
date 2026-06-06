import json
import vosk
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pypinyin import lazy_pinyin, Style

model = vosk.Model("model")
SAMPLE_RATE = 16000

app = FastAPI()

def convert_to_pinyin(text: str) -> str:
    pinyin_list = lazy_pinyin(text, style=Style.TONE)
    return " ".join(pinyin_list)

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    rec = vosk.KaldiRecognizer(model, SAMPLE_RATE)
    
    try:
        while True:
            data = await websocket.receive_bytes()
            
            is_final = await asyncio.to_thread(rec.AcceptWaveform, data)
            
            if is_final:
                result = json.loads(rec.Result())
                if result.get("text"):
                    pinyin_text = convert_to_pinyin(result["text"])
                    await websocket.send_json({"type": "final", "text": pinyin_text})
            else:
                partial = json.loads(rec.PartialResult())
                if partial.get("partial"):
                    pinyin_partial = convert_to_pinyin(partial["partial"])
                    await websocket.send_json({"type": "partial", "text": pinyin_partial})
                    
    except WebSocketDisconnect:
        print("Client disconnected normally.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass