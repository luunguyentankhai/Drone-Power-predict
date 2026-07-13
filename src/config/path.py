from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent

DATA_PATH = BASE / "data"
DATA_PATH.mkdir(parents=True, exist_ok=True)

RAW_PATH = DATA_PATH / "raw"
RAW_PATH.mkdir(parents=True, exist_ok=True)

PROCESS_PATH = DATA_PATH / "processed"
PROCESS_PATH.mkdir(parents=True, exist_ok=True)

LOG_PATH = BASE / "logs"
LOG_PATH.mkdir(parents=True, exist_ok=True)
