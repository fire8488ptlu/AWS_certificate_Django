#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# ✅ Import your custom DB check utility
from db_utils import ensure_database_exists

def main():

    # ✅ Ensure DB exists before Django starts
    if any(cmd in sys.argv for cmd in ['runserver', 'migrate', 'shell']):
        ensure_database_exists()
        
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coreconfig.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
