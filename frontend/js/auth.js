const auth = {
    async login(email, password) {
        try {
            const response = await loginUser(email, password); // From api.js
            if (response && response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userId', response.userId); // Store userId if needed
                console.log('Login successful, token stored.');
                // Optionally, fetch user profile here to store more user info locally
                // Or rely on fetching it when dashboard loads.
                return true;
            } else {
                throw new Error(response.error || 'Login failed: No token received.');
            }
        } catch (error) {
            console.error('Login error in auth.js:', error.message);
            // Propagate the error message for display in the UI
            throw error;
        }
    },

    async register(userData) {
        // userData: { firstName, lastName, email, password }
        try {
            const response = await registerUser(userData); // From api.js
            if (response && response.userId) {
                console.log('Registration successful:', response.message);
                // Optionally, automatically log in the user here by calling auth.login
                // or redirect to login page with a success message.
                return response; // Contains userId, email, message
            } else {
                throw new Error(response.error || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error in auth.js:', error.message);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        // Potentially remove other user-specific stored data
        console.log('User logged out, token removed.');
        // Navigation to login will be handled by main.js or router
    },

    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        // Basic check; could be enhanced to check token expiry if JWT library is used on frontend
        return !!token;
    },

    getToken() {
        return localStorage.getItem('authToken');
    },

    getUserId() {
        return localStorage.getItem('userId');
    }
};

console.log('auth.js loaded');
