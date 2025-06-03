from app.models import db
from app.models.user_models import User
# from flask_jwt_extended import create_access_token
# from datetime import timedelta

def register_user(data):
    """
    Placeholder for user registration logic.
    - Validate data
    - Check if user already exists
    - Create User object
    - Save to DB
    """
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    if not email or not password:
        return {"error": "Email and password are required."}, 400

    if User.query.filter_by(email=email.lower()).first():
        return {"error": "Email already registered."}, 400

    try:
        new_user = User(
            email=email,
            password=password, # Password will be hashed by the User model's set_password
            first_name=first_name,
            last_name=last_name
        )
        db.session.add(new_user)
        db.session.commit()
        # For MVP, just return basic info. User model can be extended with a to_dict() method.
        return {
            "userId": new_user.id,
            "email": new_user.email,
            "firstName": new_user.first_name,
            "message": "User registered successfully."
        }, 201
    except Exception as e:
        db.session.rollback()
        # In production, log the error e
        return {"error": "Registration failed due to an internal error."}, 500


def login_user(data):
    """
    Placeholder for user login logic.
    - Validate data
    - Find user by email
    - Check password
    - Generate JWT token
    """
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return {"error": "Email and password are required."}, 400

    user = User.query.filter_by(email=email.lower()).first()

    if user and user.check_password(password):
        # Placeholder for JWT token generation
        # access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
        access_token = "placeholder_jwt_token_for_" + user.id # Replace with actual JWT
        return {
            "userId": user.id,
            "token": access_token,
            "message": "Login successful."
        }, 200
    else:
        return {"error": "Invalid email or password."}, 401
