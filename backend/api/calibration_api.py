from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def run_calibration():
    return {"status": "calibrated"}

@router.get("/")
def get_calibration():
    import json
    import os
    if os.path.exists("calibration.json"):
        with open("calibration.json", "r") as f:
            return json.load(f)
    return {}
