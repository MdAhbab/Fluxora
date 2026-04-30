#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"

REQUIRED_PY = [
    ("django", "django"),
    ("rest_framework", "djangorestframework"),
    ("celery", "celery"),
    ("channels", "channels"),
    ("MySQLdb", "mysqlclient"),
]


def run(cmd, cwd=None, check=True):
    return subprocess.run(cmd, cwd=cwd, check=check)


def ensure_python_packages():
    missing = []
    for module, package in REQUIRED_PY:
        try:
            __import__(module)
        except Exception:
            if package not in missing:
                missing.append(package)
    if not missing:
        print("Python packages already satisfied.")
        return

    print("Installing missing Python packages:", ", ".join(missing))
    try:
        run([sys.executable, "-m", "pip", "install", *missing])
    except subprocess.CalledProcessError:
        if "mysqlclient" in missing:
            print("mysqlclient failed to install. You may need MySQL client libraries.")
            print("On macOS: brew install mysql-client")
        raise


def ensure_node_packages():
    if not FRONTEND_DIR.exists():
        print("Frontend directory not found; skipping npm install.")
        return
    if shutil.which("npm") is None:
        print("npm not found. Install Node.js to run the frontend.")
        return
    node_modules = FRONTEND_DIR / "node_modules"
    if node_modules.exists():
        print("Frontend node_modules present.")
        return
    print("Installing frontend packages...")
    run(["npm", "install"], cwd=FRONTEND_DIR)


def seed_demo_data():
    if not BACKEND_DIR.exists():
        raise RuntimeError("Backend directory not found.")
    run([sys.executable, "manage.py", "seed_demo_data"], cwd=BACKEND_DIR)


def migrate_db():
    if not BACKEND_DIR.exists():
        raise RuntimeError("Backend directory not found.")
    run([sys.executable, "manage.py", "migrate"], cwd=BACKEND_DIR)


def terminate_process(proc, label):
    if not proc or proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        print(f"Force killing {label}...")
        proc.kill()


def start_services(run_backend=True, run_frontend=True):
    backend_proc = None
    frontend_proc = None

    if run_backend:
        backend_cmd = [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"]
        backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)
        print("Backend running at http://127.0.0.1:8000")

    if run_frontend:
        frontend_cmd = ["npm", "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)
        print("Frontend running at http://127.0.0.1:5173")

    try:
        if backend_proc:
            backend_proc.wait()
        if frontend_proc:
            frontend_proc.wait()
    except KeyboardInterrupt:
        print("Shutting down...")
        terminate_process(backend_proc, "backend")
        terminate_process(frontend_proc, "frontend")


def main():
    parser = argparse.ArgumentParser(description="Run Fluxora frontend and backend.")
    parser.add_argument("--migrate", action="store_true", help="Run Django migrations before starting servers.")
    parser.add_argument("--seed", action="store_true", help="Run seed_demo_data before starting servers.")
    parser.add_argument("--skip-install", action="store_true", help="Skip installing missing packages.")
    parser.add_argument("--no-frontend", action="store_true", help="Skip starting the frontend.")
    parser.add_argument("--no-backend", action="store_true", help="Skip starting the backend.")
    args = parser.parse_args()

    if not args.skip_install:
        ensure_python_packages()
        ensure_node_packages()

    if args.migrate:
        migrate_db()

    if args.seed:
        seed_demo_data()

    run_backend = not args.no_backend
    run_frontend = not args.no_frontend
    if not run_backend and not run_frontend:
        print("Nothing to run. Enable backend or frontend.")
        return

    start_services(run_backend=run_backend, run_frontend=run_frontend)


if __name__ == "__main__":
    main()
