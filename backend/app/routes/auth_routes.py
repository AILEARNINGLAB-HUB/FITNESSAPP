from flask import Blueprint, request, jsonify
from app.services import auth_service # Placeholder, real services will handle logic
# from flask_jwt_extended import create_access_token # Will be used in actual service

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint.
    Expects JSON payload with firstName, lastName, email, password.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    # In a real app, this logic would be in auth_service.register_user(data)
    # For MVP structure, service call is shown, but direct handling for placeholder:

    # Dummy response, actual logic would involve validation, user creation, DB interaction via service
    # response, status_code = auth_service.register_user(data) # This is the ideal call

    # Placeholder direct response for structure demonstration:
    required_fields = ['email', 'password', 'firstName', 'lastName']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields (email, password, firstName, lastName)"}), 400

    # This is where you would call the service function:
    # result, status_code = auth_service.register_user(data)
    # For now, a direct placeholder response:
    if data.get('email') == "exists@example.com": # Simulate existing user
         return jsonify({"error": "Email already registered."}), 400

    # Simulate successful registration
    user_id_placeholder = "user-uuid-from-db"
    response = {
        "userId": user_id_placeholder,
        "email": data.get('email'),
        "firstName": data.get('firstName'),
        "message": "User registered successfully (placeholder)."
    }
    status_code = 201

    return jsonify(response), status_code


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint.
    Expects JSON payload with email, password.
    Returns JWT on success.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    # In a real app, this logic would be in auth_service.login_user(data)
    # response, status_code = auth_service.login_user(data) # This is the ideal call

    # Placeholder direct response for structure demonstration:
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Simulate user check and password validation
    if email == "gooduser@example.com" and password == "password123":
        user_id_placeholder = "user-uuid-from-db-gooduser"
        # In a real app: access_token = create_access_token(identity=user_id_placeholder)
        access_token_placeholder = f"mock_jwt_token_for_{user_id_placeholder}"
        response = {
            "userId": user_id_placeholder,
            "token": access_token_placeholder,
            "message": "Login successful (placeholder)."
        }
        status_code = 200
    else:
        response = {"error": "Invalid email or password (placeholder)."}
        status_code = 401

    return jsonify(response), status_code
