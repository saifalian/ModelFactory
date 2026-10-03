from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_macros():
    return []

@router.post("/")
def create_macro(macro: dict):
    return {"status": "created"}

@router.get("/{id}")
def get_macro(id: str):
    return {}

@router.put("/{id}")
def update_macro(id: str, macro: dict):
    return {"status": "updated"}

@router.post("/{id}/dry-run")
def dry_run(id: str):
    return {"status": "running"}

@router.post("/{id}/launch")
def launch_agent(id: str):
    return {"status": "launched"}
