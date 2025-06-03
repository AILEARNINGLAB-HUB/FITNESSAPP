import os
from app import create_app, db # Import create_app and db from the app package
from flask_migrate import upgrade as alembic_upgrade

# Create an application instance
# Loads .env variables by default if python-dotenv is installed and Config uses load_dotenv()
app = create_app()

@app.cli.command("initdb")
def initdb_command():
    """Creates the database tables."""
    with app.app_context():
        db.create_all()
    print("Initialized the database.")

@app.cli.command("resetdb")
def resetdb_command():
    """Drops all tables and then recreates them."""
    with app.app_context():
        db.drop_all()
        db.create_all()
    print("Reset the database.")

@app.cli.command("apply_migrations")
def apply_migrations_command():
    """Applies database migrations."""
    with app.app_context():
        # This is a simple way to apply migrations at startup.
        # For more complex scenarios, you might run `flask db upgrade` manually.
        # alembic_upgrade() # This runs 'flask db upgrade'
        # For a fresh DB, create_all might be enough if not using complex migrations yet.
        # If using Alembic for schema changes, `flask db upgrade` is the way.
        # For MVP, if starting fresh and models are defined, create_all is often sufficient.
        # If Alembic is fully set up (init, revision, upgrade), then alembic_upgrade() is correct.
        # Assuming Alembic is set up, we would use:
        try:
            print("Applying database migrations...")
            alembic_upgrade()
            print("Database migrations applied.")
        except Exception as e:
            # This can happen if the migration table itself doesn't exist
            # or if there are issues with the migration scripts.
            # For a very first run without 'flask db init', 'flask db migrate', 'flask db upgrade'
            # sequence already done, this might fail.
            # A robust startup might try create_all if migrations fail on a known "new DB" state.
            print(f"Error applying migrations: {e}")
            print("Attempting db.create_all() as a fallback for new database...")
            try:
                db.create_all() # Fallback for initial setup if migrations aren't ready
                print("db.create_all() succeeded.")
            except Exception as e_create:
                print(f"db.create_all() also failed: {e_create}")


if __name__ == '__main__':
    # In a typical production environment, a WSGI server like Gunicorn or uWSGI would be used.
    # The Flask development server is suitable for local development and testing.
    port = int(os.environ.get("PORT", 5000))

    # The following is mostly for local development.
    # For production, you'd use a proper WSGI server.
    # For initial setup, you might want to ensure the DB is created.
    with app.app_context():
        # A simple way to ensure tables exist on first run in dev.
        # Not recommended for production. Use migrations.
        # db.create_all() # This can be problematic if using Alembic for all changes.
        # Better to run `flask db init`, `flask db migrate`, `flask db upgrade` manually first.
        pass

    app.run(debug=True, host='0.0.0.0', port=port)
