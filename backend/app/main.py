import json
import time
import uuid
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from app.model import load_model, predict

HISTORY_FILE = Path(__file__).parent.parent.parent / "mobile" / "utils" / "scan_history.json"
MAX_HISTORY = 50


def _read_history() -> list:
    if not HISTORY_FILE.exists():
        return []
    try:
        return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _write_history(data: list) -> None:
    HISTORY_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(title="Plant Disease Classifier", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    data = await file.read()
    try:
        image = Image.open(BytesIO(data))
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    result = predict(image)
    return result


class ScanEntry(BaseModel):
    imageUri: str = ""
    disease: str
    confidence: float


@app.get("/history")
def get_history():
    return _read_history()


@app.post("/history")
def add_to_history(entry: ScanEntry):
    history = _read_history()
    record = {
        "id": str(uuid.uuid4()),
        "imageUri": entry.imageUri,
        "disease": entry.disease,
        "confidence": entry.confidence,
        "scannedAt": int(time.time() * 1000),
    }
    history = [record, *history][:MAX_HISTORY]
    _write_history(history)
    return record


@app.delete("/history")
def clear_history():
    _write_history([])
    return {"status": "ok"}
