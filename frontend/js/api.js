// Ensure this matches your backend API's base URL and port
const API_BASE_URL = 'http://localhost:5000/api'; // Example, adjust if your backend runs elsewhere

async function request(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });

    if (requiresAuth) {
        const token = localStorage.getItem('authToken');
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        } else {
            // Handle cases where auth is required but no token is found
            // This might involve redirecting to login or throwing an error
            console.warn('Auth token not found for protected route:', endpoint);
            // For now, let the request proceed; backend will deny if token is truly required and missing/invalid
        }
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            console.error('API Error:', response.status, errorData);
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Handle cases where response might be empty (e.g., 204 No Content)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return {}; // Or handle as text, blob, etc., if needed
        }

    } catch (error) {
        console.error('Fetch API Error:', error);
        throw error; // Re-throw to be caught by calling function
    }
}

// --- Authentication Endpoints ---
async function registerUser(userData) {
    // userData: { firstName, lastName, email, password }
    return request('/auth/register', 'POST', userData, false);
}

async function loginUser(email, password) {
    return request('/auth/login', 'POST', { email, password }, false);
}

// --- User Profile & Goals Endpoints ---
async function getUserProfile() {
    return request('/users/me', 'GET', null, true);
}

async function updateUserProfile(profileData) {
    // profileData: { firstName, lastName, bio, interests (as array/JSON) }
    return request('/users/me', 'PUT', profileData, true);
}

async function getUserLearningGoals() {
    // For MVP, this might be part of user profile or a separate call
    // As per API_Specifications, it's /users/me/goals
    // return request('/users/me/goals', 'GET', null, true);
    console.warn('getUserLearningGoals not fully implemented in MVP backend yet via API spec.');
    // Simulate for now if needed by UI, or integrate if backend endpoint exists
    return Promise.resolve({ learningGoals: [{goalId: "temp1", description: "Learn Python (simulated)"}] });
}

async function updateUserLearningGoals(goalsData) {
    // goalsData: { learningGoals: [{description: "New Goal"}, ...] }
    // return request('/users/me/goals', 'PUT', goalsData, true);
    console.warn('updateUserLearningGoals not fully implemented in MVP backend yet via API spec.');
    return Promise.resolve({ learningGoals: goalsData.learningGoals, message: "Goals updated (simulated)" });
}


// --- Courses & Learning Paths ---
async function listAvailableCourses(page = 1, limit = 10) {
    return request(`/courses?page=${page}&limit=${limit}`, 'GET', null, false); // Assuming courses are public
}

async function getCourseDetails(courseId) {
    return request(`/courses/${courseId}`, 'GET', null, false); // Assuming course details are public
}

async function getRecommendedCourses() {
    return request('/users/me/recommendations/courses', 'GET', null, true);
}

// --- Learning Progression ---
async function getLessonDetails(lessonId) {
    return request(`/lessons/${lessonId}`, 'GET', null, true); // Assuming lesson access requires auth
}

async function startLesson(lessonId) {
    return request(`/users/me/progress/lessons/${lessonId}/start`, 'POST', null, true);
}

async function completeLessonContent(lessonId) {
    return request(`/users/me/progress/lessons/${lessonId}/completeContent`, 'POST', null, true);
}

async function submitQuiz(quizId, lessonIdContext, answers) {
    // answers: [{ questionId: "q1", answer: "A" }, ...]
    return request(`/users/me/progress/quizzes/${quizId}/submit`, 'POST', { lessonIdContext, answers }, true);
}

async function getUserCourseProgress(courseId) {
    return request(`/users/me/progress/courses/${courseId}`, 'GET', null, true);
}

// Example of how to export if using modules (not strictly necessary for simple global scripts)
// window.ApiService = { ... }; // Or attach to window object for global access
// For MVP, functions are global by default when script is loaded.

console.log('api.js loaded');
