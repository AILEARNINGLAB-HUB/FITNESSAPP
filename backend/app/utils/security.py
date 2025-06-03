from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2."""
    return generate_password_hash(password, method='pbkdf2:sha256')

def check_password(hashed_password: str, password: str) -> bool:
    """Checks if the provided password matches the hashed password."""
    return check_password_hash(hashed_password, password)
