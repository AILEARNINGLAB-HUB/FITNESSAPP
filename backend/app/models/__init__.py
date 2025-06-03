from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models here to ensure they are known to SQLAlchemy and Alembic
# This also makes it easier to import them elsewhere, e.g., from app.models import User, Course

# from .user_models import User, UserProfile, UserGoal
# from .content_models import Course, UserCourseEnrollment

# It's generally better to import them after db is initialized and within the app context,
# or ensure that blueprints that use them are registered after models are defined and imported.
# For now, we'll rely on them being imported in the main __init__.py or when used by routes.
