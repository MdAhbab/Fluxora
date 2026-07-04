#!/usr/bin/env python3
"""
Fluxora dev runner.

Bootstrap order
---------------
1. If we are NOT already inside a venv, create one at <ROOT>/.venv and
   re-exec this script with the venv's Python so the rest of the logic
   always runs inside the venv.
2. Ensure all Python packages from backend/requirements.txt are installed
   into the venv (pip install -r … inside the venv never touches system
   Python, so the PEP-668 "externally managed" error cannot occur).
3. Ensure frontend node_modules are present.
4. Optionally run Django migrations / seed data.
5. Start Django dev server + Vite dev server concurrently.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
VENV_DIR = ROOT / ".venv"

# ─── Platform helpers ────────────────────────────────────────────────────────

def _venv_python() -> Path:
    """Return the Python executable inside .venv (cross-platform)."""
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python3"


def _venv_pip() -> Path:
    """Return the pip executable inside .venv (cross-platform)."""
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "pip.exe"
    return VENV_DIR / "bin" / "pip"


def _inside_venv() -> bool:
    """True when the *current* interpreter belongs to our .venv."""
    try:
        return Path(sys.prefix).resolve() == VENV_DIR.resolve()
    except Exception:
        return False


# ─── Virtual-environment bootstrap ───────────────────────────────────────────

def bootstrap_venv() -> None:
    """
    Ensure .venv exists.  If we are not already running inside it, create it
    (if needed) then re-exec this very script with the venv's Python.
    The re-exec replaces the current process, so the code below this function
    only runs when we are already inside the venv.
    """
    if _inside_venv():
        return  # already in our venv – nothing to do

    # Create the venv if it doesn't exist yet.
    if not _venv_python().exists():
        print(f"[run.py] Creating virtual environment at {VENV_DIR} …")
        venv.create(str(VENV_DIR), with_pip=True, clear=False)
        print("[run.py] Virtual environment created.")

    # Re-exec with the venv Python.  os.execl replaces the process so we
    # never return from this call.
    python = str(_venv_python())
    print(f"[run.py] Re-executing with venv Python: {python}")
    os.execl(python, python, *sys.argv)


# ─── Generic subprocess helper ───────────────────────────────────────────────

def run(cmd, cwd=None, check=True):
    return subprocess.run(cmd, cwd=cwd, check=check)


# ─── Package installation ─────────────────────────────────────────────────────

def _pip_install(*packages: str) -> bool:
    """Install one or more packages with the venv pip.  Returns True on success."""
    pip = str(_venv_pip())
    result = subprocess.run(
        [pip, "install", "--quiet", *packages],
        capture_output=False,
    )
    return result.returncode == 0


def ensure_python_packages() -> None:
    """
    Install every package in backend/requirements.txt into the venv.
    mysqlclient is attempted first; if it fails (common on macOS without the
    MySQL C headers) we fall back to PyMySQL with the Django compatibility
    shim so the rest of the stack still works.
    """
    requirements = BACKEND_DIR / "requirements.txt"
    pip = str(_venv_pip())

    if requirements.exists():
        print("[run.py] Installing Python packages from requirements.txt …")

        # Separate mysqlclient out so we can handle its failure gracefully.
        lines = requirements.read_text().splitlines()
        non_mysql = [l for l in lines if l.strip() and not l.strip().lower().startswith("mysqlclient")]
        has_mysql = any(l.strip().lower().startswith("mysqlclient") for l in lines)

        # Install everything except mysqlclient first.
        if non_mysql:
            result = subprocess.run(
                [pip, "install", "--quiet", *[l.strip() for l in non_mysql if l.strip() and not l.startswith("#")]],
            )
            if result.returncode != 0:
                print("[run.py] WARNING: Some packages failed to install – check output above.")

        # Try mysqlclient; fall back to PyMySQL if it fails.
        if has_mysql:
            _install_mysql_driver()
    else:
        # No requirements.txt – install the known essentials.
        print("[run.py] No requirements.txt found; installing essential packages …")
        essentials = [
            "django",
            "djangorestframework",
            "celery",
            "channels",
            "django-cors-headers",
            "python-dotenv",
        ]
        result = subprocess.run([pip, "install", "--quiet", *essentials])
        if result.returncode != 0:
            print("[run.py] WARNING: Some packages failed to install.")
        _install_mysql_driver()

    print("[run.py] Python packages ready.")


def _install_mysql_driver() -> None:
    """
    Try mysqlclient first.  If that fails, install PyMySQL and monkey-patch
    it so Django's MySQL backend works without any native MySQL headers.
    """
    pip = str(_venv_pip())
    print("[run.py] Trying to install mysqlclient …")
    result = subprocess.run(
        [pip, "install", "--quiet", "mysqlclient"],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print("[run.py] mysqlclient installed successfully.")
        return

    # mysqlclient failed (usually because mysql-client headers are missing).
    print(
        "[run.py] mysqlclient could not be compiled (MySQL C headers not found).\n"
        "         Falling back to PyMySQL (pure-Python MySQL driver).\n"
        "         To use mysqlclient natively: brew install mysql-client\n"
        "         then re-run this script."
    )
    ok = _pip_install("PyMySQL")
    if ok:
        print("[run.py] PyMySQL installed.  Applying Django compatibility shim …")
        _write_pymysql_shim()
    else:
        print("[run.py] WARNING: Could not install any MySQL driver. DB features will not work.")


def _write_pymysql_shim() -> None:
    """
    Write (or update) a small shim at backend/pymysql_shim.py that calls
    ``pymysql.install_as_MySQLdb()`` and add an import of it to Django's
    manage.py / wsgi.py / asgi.py if not already present.
    """
    shim_path = BACKEND_DIR / "pymysql_shim.py"
    shim_code = (
        "# Auto-generated by run.py – makes PyMySQL a drop-in for mysqlclient.\n"
        "import pymysql\n"
        "pymysql.install_as_MySQLdb()\n"
    )
    shim_path.write_text(shim_code)
    print(f"[run.py] Wrote {shim_path}")

    # Patch manage.py to import the shim before Django boots.
    _patch_file_with_shim(BACKEND_DIR / "manage.py")


def _patch_file_with_shim(target: Path) -> None:
    """Insert ``import pymysql_shim`` near the top of target if not already there."""
    if not target.exists():
        return
    text = target.read_text()
    if "pymysql_shim" in text:
        return  # already patched
    # Insert after the first ``import …`` / ``from …`` block.
    lines = text.splitlines(keepends=True)
    insert_at = 0
    for i, line in enumerate(lines):
        if line.startswith("import ") or line.startswith("from "):
            insert_at = i + 1
    lines.insert(insert_at, "import pymysql_shim  # noqa: F401 – PyMySQL compatibility shim\n")
    target.write_text("".join(lines))
    print(f"[run.py] Patched {target.name} with pymysql_shim import.")


# ─── Frontend packages ────────────────────────────────────────────────────────

def ensure_node_packages() -> None:
    if not FRONTEND_DIR.exists():
        print("[run.py] Frontend directory not found; skipping npm install.")
        return
    if shutil.which("npm") is None:
        print("[run.py] npm not found.  Install Node.js to run the frontend.")
        return
    node_modules = FRONTEND_DIR / "node_modules"
    if node_modules.exists():
        print("[run.py] Frontend node_modules already present.")
        return
    print("[run.py] Installing frontend packages …")
    run([shutil.which("npm"), "install"], cwd=FRONTEND_DIR)


# ─── Django helpers ───────────────────────────────────────────────────────────

def migrate_db() -> None:
    if not BACKEND_DIR.exists():
        raise RuntimeError("Backend directory not found.")
    run([sys.executable, "manage.py", "migrate"], cwd=BACKEND_DIR)


def seed_demo_data() -> None:
    if not BACKEND_DIR.exists():
        raise RuntimeError("Backend directory not found.")
    run([sys.executable, "manage.py", "seed_demo_data"], cwd=BACKEND_DIR)


# ─── Process management ───────────────────────────────────────────────────────

def terminate_process(proc, label: str) -> None:
    if not proc or proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        print(f"[run.py] Force killing {label} …")
        proc.kill()


def start_services(run_backend: bool = True, run_frontend: bool = True) -> None:
    import socket

    def get_free_port(start: int) -> int:
        for p in range(start, start + 100):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                if s.connect_ex(("127.0.0.1", p)) != 0:
                    return p
        return start

    backend_proc = frontend_proc = None
    env = os.environ.copy()

    if run_backend:
        backend_port = get_free_port(8000)
        backend_proc = subprocess.Popen(
            [sys.executable, "manage.py", "runserver", f"127.0.0.1:{backend_port}"],
            cwd=BACKEND_DIR,
        )
        print(f"[run.py] Backend  → http://127.0.0.1:{backend_port}")
        env["BACKEND_PORT"] = str(backend_port)

    if run_frontend and FRONTEND_DIR.exists() and shutil.which("npm"):
        frontend_port = get_free_port(5173)
        frontend_proc = subprocess.Popen(
            [shutil.which("npm"), "run", "dev", "--", "--port", str(frontend_port)],
            cwd=FRONTEND_DIR,
            env=env,
        )
        print(f"[run.py] Frontend → http://127.0.0.1:{frontend_port}")

    try:
        if backend_proc:
            backend_proc.wait()
        if frontend_proc:
            frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[run.py] Shutting down …")
        terminate_process(backend_proc, "backend")
        terminate_process(frontend_proc, "frontend")


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Run Fluxora frontend and backend.")
    parser.add_argument("--migrate", action="store_true", help="Run Django migrations before starting.")
    parser.add_argument("--seed", action="store_true", help="Seed demo data before starting.")
    parser.add_argument("--skip-install", action="store_true", help="Skip package installation.")
    parser.add_argument("--no-frontend", action="store_true", help="Skip the frontend dev server.")
    parser.add_argument("--no-backend", action="store_true", help="Skip the backend dev server.")
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
        print("[run.py] Nothing to run.  Pass --no-frontend or --no-backend selectively.")
        return

    start_services(run_backend=run_backend, run_frontend=run_frontend)


if __name__ == "__main__":
    # Step 1: guarantee we are inside our own .venv (creates it + re-execs if needed).
    bootstrap_venv()
    # Step 2: the rest of the script now runs inside the venv.
    main()
