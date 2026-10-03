import sqlite3
import json
import os

DB_PATH = "data/modelfactory.db"

def get_db():
    if not os.path.exists("data"):
        os.makedirs("data")
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS models (
            id TEXT PRIMARY KEY,
            data JSON
        );
        CREATE TABLE IF NOT EXISTS macros (
            id TEXT PRIMARY KEY,
            data JSON
        );
        CREATE TABLE IF NOT EXISTS training_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model_id TEXT,
            timestamp TEXT,
            log_data JSON
        );
    ''')
    conn.commit()
    conn.close()

init_db()
