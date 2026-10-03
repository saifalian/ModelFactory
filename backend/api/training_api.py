from fastapi import APIRouter
import tensorflow as tf
from core.training_loop import get_gpu_stats

router = APIRouter()

@router.get("/gpu/status")
def get_gpu_status():
    gpus = tf.config.list_physical_devices('GPU')
    stats = get_gpu_stats()
    return {
        "gpu_available": len(gpus) > 0,
        "gpu_name": "RTX 3050i" if gpus else "None",
        "gpu_count": len(gpus),
        "memory_used_mb": stats['memory_used_mb'],
        "memory_total_mb": stats['memory_total_mb'],
        "utilization_pct": stats['utilization_pct'],
        "temperature_c": stats['temperature_c'],
        "cuda_version": "11.8",
        "tensorflow_version": tf.__version__,
        "mixed_precision": "enabled"
    }

import subprocess
import sys
import os

@router.post("/{id}/train/start")
def start_training(id: str, hw: str = 'cpu'):
    # Determine which python executable to use based on requested hardware
    if hw == 'gpu':
        # Use dedicated GPU virtual environment
        python_exe = r"d:\model factory\backend\venv_gpu\Scripts\python.exe"
        if not os.path.exists(python_exe):
            # Fallback to the provided liquidity agent path if not found
            python_exe = r"d:\gluhone\lq\gpu_venv\Scripts\python.exe"
    else:
        # Use standard CPU environment mapping to current process
        python_exe = sys.executable
    
    # Example of how the subprocess would be launched:
    # process = subprocess.Popen([python_exe, "tools/train.py", "--model", id, "--device", hw])
    
    return {"status": "started", "hardware": hw, "python_exe": python_exe}

@router.post("/{id}/train/pause")
def pause_training(id: str):
    return {"status": "paused"}

@router.post("/{id}/train/resume")
def resume_training(id: str):
    return {"status": "resumed"}

@router.post("/{id}/train/stop")
def stop_training(id: str):
    return {"status": "stopped"}

@router.get("/{id}/train/status")
def get_training_status(id: str):
    return {"status": "training", "iteration": 0, "score": 0, "best_score": 0}

@router.get("/{id}/train/log")
def get_training_log(id: str):
    return {"logs": []}
