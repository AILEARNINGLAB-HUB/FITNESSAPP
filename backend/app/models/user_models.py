from . import db # Import db from the current package (__init__.py)
from app.utils.security import hash_password, check_password
from sqlalchemy.dialects.postgresql import UUID # If using PostgreSQL and UUIDs
import uuid # For generating UUIDs if not handled by DB
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # UserID as UUID string
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False) # Increased length for pbkdf2:sha256
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    goals = db.relationship('UserGoal', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    enrollments = db.relationship('UserCourseEnrollment', backref='user', lazy='dynamic', cascade="all, delete-orphan")


    def __init__(self, email, password, first_name=None, last_name=None):
        self.email = email.lower()
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name

    def set_password(self, password):
        self.password_hash = hash_password(password)

    def check_password(self, password):
        return check_password(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # ProfileID as UUID string
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, unique=True) # UserID Foreign Key
    bio = db.Column(db.Text, nullable=True)
    # For MVP, interests can be a simple JSON or comma-separated string.
    # Using JSONB for PostgreSQL or Text for SQLite.
    interests = db.Column(db.JSON, nullable=True) # Or db.Text for SQLite, handle parsing in service

    # Add other profile fields from schema as needed for MVP
    # e.g., preferred_language, timezone, learning_pace_preference, etc.

    def __repr__(self):
        return f'<UserProfile for User {self.user_id}>'

class UserGoal(db.Model):
    __tablename__ = 'user_goals'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # GoalID as UUID string
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False) # UserID Foreign Key
    goal_description = db.Column(db.Text, nullable=False)
    # Simplified status for MVP. Could be an Enum.
    status = db.Column(db.String(50), default='active') # e.g., 'active', 'achieved', 'abandoned'
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    target_date = db.Column(db.Date, nullable=True)

    def __repr__(self):
        return f'<UserGoal {self.goal_description[:30]}... for User {self.user_id}>'
