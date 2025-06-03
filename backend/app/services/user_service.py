from app.models import db
from app.models.user_models import User, UserProfile # Assuming UserProfile is used

def get_user_profile_by_id(user_id):
    """
    Placeholder for fetching a user's profile by their ID.
    """
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return {"error": "User not found"}, 404

    # For MVP, we can just return basic User model fields.
    # UserProfile model can be queried if more details are needed.
    user_profile_data = {
        "userId": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "registrationDate": user.registration_date.isoformat() if user.registration_date else None
    }

    # Example of including UserProfile data if it exists
    if user.profile:
        user_profile_data["bio"] = user.profile.bio
        user_profile_data["interests"] = user.profile.interests # Assuming interests is JSON serializable
    else:
        user_profile_data["bio"] = None
        user_profile_data["interests"] = None

    return user_profile_data, 200


def update_user_profile_by_id(user_id, data):
    """
    Placeholder for updating a user's profile.
    - Find user
    - Update fields
    - Save to DB
    """
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return {"error": "User not found"}, 404

    # Update basic User fields if provided
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']

    # Update UserProfile fields
    # Ensure UserProfile record exists, create if not (common pattern)
    if not user.profile:
        user.profile = UserProfile(user_id=user.id)
        db.session.add(user.profile) # Add to session if new

    if 'bio' in data:
        user.profile.bio = data['bio']
    if 'interests' in data: # Assuming interests is a list or JSON compatible type
        user.profile.interests = data['interests']

    try:
        db.session.commit()
        # Return the updated profile data
        updated_profile_data, _ = get_user_profile_by_id(user_id) # Reuse the get function
        return updated_profile_data, 200
    except Exception as e:
        db.session.rollback()
        # Log error e
        return {"error": "Profile update failed due to an internal error."}, 500
