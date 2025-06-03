from . import db # Import db from the current package (__init__.py)
from sqlalchemy.dialects.postgresql import UUID # If using PostgreSQL and UUIDs
import uuid # For generating UUIDs if not handled by DB
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # CourseID as UUID string
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    # For MVP, skill_tags and learning_objectives can be simple JSON or Text fields
    # Or handled via separate Tagging tables post-MVP for better querying
    skill_tags = db.Column(db.JSON, nullable=True) # e.g., ["Python", "Beginner"]
    learning_objectives = db.Column(db.JSON, nullable=True) # e.g., ["Understand variables", "Write basic scripts"]
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True) # Optional: if trainers create courses
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_published = db.Column(db.Boolean, default=False)

    # Relationships
    # modules = db.relationship('Module', backref='course', lazy='dynamic', cascade="all, delete-orphan")
    enrollments = db.relationship('UserCourseEnrollment', backref='course', lazy='dynamic', cascade="all, delete-orphan")


    def __repr__(self):
        return f'<Course {self.title}>'

# MVP Simplified: Modules and Lessons might not be separate DB models yet,
# or could be JSON structures within the Course model or a simpler Lesson model.
# For now, we'll focus on Course and Enrollment.

# class Module(db.Model):
#     __tablename__ = 'modules'
#     id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
#     course_id = db.Column(db.String(36), db.ForeignKey('courses.id'), nullable=False)
#     title = db.Column(db.String(200), nullable=False)
#     module_order = db.Column(db.Integer, nullable=False)
#     # lessons = db.relationship('Lesson', backref='module', lazy='dynamic', cascade="all, delete-orphan")

# class Lesson(db.Model):
#     __tablename__ = 'lessons'
#     id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
#     module_id = db.Column(db.String(36), db.ForeignKey('modules.id'), nullable=False)
#     title = db.Column(db.String(200), nullable=False)
#     lesson_order = db.Column(db.Integer, nullable=False)
#     content_type = db.Column(db.String(50), nullable=False) # 'text', 'video', 'quiz'
#     content_data = db.Column(db.JSON, nullable=True) # Store text, video URL, quiz ID etc.
    # quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=True)


class UserCourseEnrollment(db.Model):
    __tablename__ = 'user_course_enrollments'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # EnrollmentID
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(36), db.ForeignKey('courses.id'), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='enrolled') # e.g., 'enrolled', 'in_progress', 'completed'
    # progress_percent = db.Column(db.Float, default=0.0)
    # completion_date = db.Column(db.DateTime, nullable=True)

    # Unique constraint to prevent multiple enrollments for the same user in the same course
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='_user_course_uc'),)

    def __repr__(self):
        return f'<UserCourseEnrollment User {self.user_id} in Course {self.course_id}>'


# Placeholder for Quiz and related models (Post-MVP or very simplified for MVP)
# class Quiz(db.Model):
#   __tablename__ = 'quizzes'
#   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
#   title = db.Column(db.String(200), nullable=False)
#   pass_threshold = db.Column(db.Float, default=75.0) # e.g. 75%

# class Question(db.Model):
#   __tablename__ = 'questions'
#   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
#   quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=True) # Can be part of a question bank too
#   question_text = db.Column(db.Text, nullable=False)
#   question_type = db.Column(db.String(50), nullable=False) # 'multiple_choice', 'single_choice'
#   options = db.Column(db.JSON, nullable=True) # e.g., [{"id": "a", "text": "Option A"}]
#   correct_answer = db.Column(db.JSON, nullable=True) # e.g., ["a"]

# class UserQuizAttempt(db.Model):
#   __tablename__ = 'user_quiz_attempts'
#   id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
#   user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
#   quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=False)
#   lesson_id_context = db.Column(db.String(36), db.ForeignKey('lessons.id'), nullable=True)
#   score = db.Column(db.Float, nullable=False)
#   passed = db.Column(db.Boolean, nullable=False)
#   attempt_date = db.Column(db.DateTime, default=datetime.utcnow)
#   answers = db.Column(db.JSON, nullable=True) # Store user's answers to each question
    # Example answer: [{"question_id": "q-uuid-501", "answer_given": "A", "is_correct": True}]
