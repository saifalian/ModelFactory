import json
import os

# GPU Configuration
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['DML_VISIBLE_DEVICES'] = '1'
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
import tensorflow as tf
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
    print(f"GPU enabled: {len(gpus)} GPU(s) found")
    print(f"GPU name: {tf.test.gpu_device_name()}")
else:
    print("WARNING: No GPU found, running on CPU")

def warmup_gpu():
    if tf.config.list_physical_devices('GPU'):
        dummy = tf.zeros([1, 224, 224, 3])
        dummy_model = tf.keras.applications.MobileNetV2(
            input_shape=(224, 224, 3), include_top=False, weights=None)
        _ = dummy_model(dummy, training=False)
        del dummy_model, dummy
        print("GPU warmup complete")

# Create default settings if not exists
if not os.path.exists("settings.json"):
    with open("settings.json", "w") as f:
        json.dump({
            "coinglass_path": "C:\\Program Files\\Coinglass\\Coinglass.exe",
            "tesseract_path": "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
            "ollama_enabled": False,
            "ollama_model": "qwen3.5:0.8b",
            "ollama_keep_alive": 0,
            "auto_save_frequency": 10,
            "max_attempts": 200,
            "popup_wait_time": 0.7,
            "attempt_timeout": 60,
            "default_confidence_threshold": 0.65,
            "backup_enabled": True,
            "backup_location": "D:\\Backups\\ModelFactory\\",
            "backup_schedule": "daily",
            "backup_keep_last": 7,
            "scheduler_enabled": False,
            "drift_detection": True
        }, f, indent=4)

if not os.path.exists("calibration.json"):
    with open("calibration.json", "w") as f:
        json.dump({}, f, indent=4)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import models_api, training_api, calibration_api, macro_api

app = FastAPI(title="ModelFactory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_api.router, prefix="/api/models", tags=["Models"])
app.include_router(training_api.router, prefix="/api/models", tags=["Training"])
app.include_router(calibration_api.router, prefix="/api/calibrate", tags=["Calibration"])
app.include_router(macro_api.router, prefix="/api/macros", tags=["Macros"])

@app.get("/api/settings")
def get_settings():
    with open("settings.json", "r") as f:
        return json.load(f)

@app.put("/api/settings")
def update_settings(settings: dict):
    with open("settings.json", "w") as f:
        json.dump(settings, f, indent=4)
    return {"status": "success"}

@app.post("/api/backup")
def run_backup():
    # Trigger backup logic
    return {"status": "success", "message": "Backup triggered"}

if __name__ == "__main__":
    import uvicorn
    # Create required directories
    for d in ["models", "macros", "exports", "backups", "data"]:
        os.makedirs(d, exist_ok=True)
    # Warmup GPU
    warmup_gpu()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
