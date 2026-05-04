from contextlib import asynccontextmanager
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from app.model import load_model, predict


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(title="Plant Disease Classifier", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
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
