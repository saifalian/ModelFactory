# Model Factory

Model Factory is a local AI training and automation workbench. It combines a Python backend, desktop automation helpers, computer-vision modules, training-loop logic, calibration utilities, and a Vite/React frontend.

The project appears designed for building, scoring, training, and monitoring models that learn from desktop/screen interactions.

## Features

- Python desktop launcher and GUI
- Backend API modules for models, macros, calibration, and training
- Vision pipeline for screen capture, OCR, preprocessing, and goal matching
- Training-loop and scoring components
- Drift and overfitting monitors
- Checkpoint management
- React frontend dashboard
- GPU dependency profile via `requirements_gpu.txt`

## Tech Stack

- Python
- FastAPI-style backend modules
- React + Vite frontend
- Computer vision and OCR utilities
- Local JSON settings
- Optional GPU/DirectML-oriented dependencies

## Project Layout

```text
backend/
├── api/
├── core/
├── database/
├── desktop/
└── vision/
frontend/
├── src/
└── package.json
gui.py
desktop.py
settings.json
requirements.txt
requirements_gpu.txt
```

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd frontend
npm install
```

For GPU experiments, review `requirements_gpu.txt` first and install only in a compatible environment.

## Run

```powershell
python gui.py
```

or use the included `start.bat` launcher.

## Notes

Generated data, model checkpoints, exports, backups, and virtual environments are intentionally excluded from version control. Store large trained artifacts separately from the source repository.

