import os
import time
import pyodbc
from dotenv import load_dotenv

load_dotenv()

RETRIES = int(os.getenv("RETRIES", 10))          # default to 10 if not set
RETRY_DELAY = int(os.getenv("RETRY_DELAY", 3000))  # default to 3000ms if not set

def connect_with_retry(conn_str):
    """Try connecting to DB with retry logic."""
    for attempt in range(1, RETRIES + 1):
        try:
            conn = pyodbc.connect(conn_str, autocommit=True)
            print(f"✅ DB connected on attempt {attempt}")
            return conn
        except Exception as e:
            print(f"⚠️ Attempt {attempt} failed: {e}")
            if attempt < RETRIES:
                time.sleep(RETRY_DELAY / 1000.0)
            else:
                raise RuntimeError("❌ Max retries reached. Could not connect to DB.")



def ensure_database_exists():
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")

    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={db_host},{db_port};"
        f"DATABASE=master;"
        f"UID={db_user};"
        f"PWD={db_password};"
    )

    try:
        with connect_with_retry(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sys.databases WHERE name = ?", db_name)
            exists = cursor.fetchone()

            if exists:
                print(f"✅ Database '{db_name}' already exists.")
            else:
                print(f"⚙️ Database '{db_name}' not found. Creating from script...")

                raw_val = os.getenv("INSERT_DATASAMPLE", "0")  # default to "0" if not set
                try:
                    INSERT_DATASAMPLE = 1 if int(raw_val) > 0 else 0
                except ValueError:
                    INSERT_DATASAMPLE = 0  # fallback if env var is not a valid integer
                    
                filename = "init_withdata.sql" if INSERT_DATASAMPLE == 1 else "init_nodata.sql"
                with open(filename, "r", encoding="utf-16") as f:
                    script = f.read()

                for stmt in script.split("GO"):
                    stmt = stmt.strip()
                    if stmt:
                        try:
                            cursor.execute(stmt)
                        except Exception as e:
                            print(f"⚠️ Error in statement:\n{stmt[:100]}...\nError: {e}")

                print(f"✅ Database '{db_name}' created from script.")

    except Exception as e:
        print(f"❌ Error during database initialization: {e}")
