from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config # Corrected import path for config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    """
    Flask application factory.
    Initializes and configures the Flask application and its extensions.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions here
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models here to ensure they are registered with SQLAlchemy
    # before any database operations (like create_all or migrations) are called.
    # This is also important for Alembic to detect model changes.
    from app.models.user_models import User, UserProfile, UserGoal
    from app.models.content_models import Course, UserCourseEnrollment
    # Add other models as they are created (e.g., Quiz, Lesson, Module etc.)

    # Register Blueprints
    # Authentication routes
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # User profile routes
    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/users')

    # Placeholder for other blueprints (courses, learning paths, etc.)
    # from app.routes.course_routes import course_bp
    # app.register_blueprint(course_bp, url_prefix='/api/courses')


    # A simple route to test if the app is running
    @app.route('/health')
    def health_check():
        return "Healthy!"

    return app
