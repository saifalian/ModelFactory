# Model Factory

Model Factory is a local project for experimenting with AI models, computer vision, and desktop automation.

In simple words, this project is made to help build and test models that can learn from screen or desktop activity. It includes a Python backend, vision tools, training logic, monitoring code, and a React frontend.

This is a research-style project. It is useful for learning how model training, screen capture, scoring, and dashboards can work together.

## What This Project Can Do

- Start from a Python desktop launcher.
- Use backend modules for models, macros, calibration, and training.
- Capture and process screen images.
- Use OCR and goal-matching style vision tools.
- Run training and scoring logic.
- Monitor drift and overfitting.
- Manage model checkpoints.
- Use a React frontend dashboard.
- Optionally review GPU dependencies in `requirements_gpu.txt`.

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

Generated data, trained model files, checkpoints, exports, backups, and virtual environments are not stored in Git.

Keep large model files outside the source repository so the GitHub project stays clean and easy to download.
