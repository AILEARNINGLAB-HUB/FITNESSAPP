# AI-Powered Adaptive Training Coach: API Specifications (MVP)

This document outlines the key RESTful API endpoints for the Minimum Viable Product (MVP) of the AI-Powered Adaptive Training Coach. All request and response bodies are in JSON format.

## Base URL

`https://api.adaptivetrainingcoach.com/v1` (Example)

## Authentication

Authentication will be token-based (e.g., JWT). A successful login or registration will return a token. This token must be included in the `Authorization` header for protected endpoints:
`Authorization: Bearer <your_jwt_token>`

---

## 1. User Authentication

### 1.1. Register User

*   **Method:** `POST`
*   **Path:** `/auth/register`
*   **Description:** Creates a new user account.
*   **Request Payload:**
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "password": "securePassword123"
    }
    ```
*   **Response Payload (Success - 201 Created):**
    ```json
    {
      "userId": "user-uuid-12345",
      "email": "john.doe@example.com",
      "firstName": "John",
      "message": "User registered successfully."
    }
    ```
*   **Response Payload (Error - 400 Bad Request):**
    ```json
    {
      "error": "Email already exists or invalid data."
    }
    ```

### 1.2. Login User

*   **Method:** `POST`
*   **Path:** `/auth/login`
*   **Description:** Authenticates a user and returns a JWT.
*   **Request Payload:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securePassword123"
    }
    ```
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "token": "jwt_access_token_string",
      "message": "Login successful."
    }
    ```
*   **Response Payload (Error - 401 Unauthorized):**
    ```json
    {
      "error": "Invalid email or password."
    }
    ```

---

## 2. User Profile & Goals

### 2.1. Get User Profile

*   **Method:** `GET`
*   **Path:** `/users/me`
*   **Description:** Retrieves the profile of the authenticated user.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "registrationDate": "2023-10-01T10:00:00Z"
    }
    ```
*   **Authentication:** Required.

### 2.2. Get User Learning Goals

*   **Method:** `GET`
*   **Path:** `/users/me/goals`
*   **Description:** Retrieves the learning goals of the authenticated user.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "learningGoals": [
        {"goalId": "goal-uuid-001", "description": "Learn Python programming basics"},
        {"goalId": "goal-uuid-002", "description": "Understand data analysis fundamentals"}
      ]
    }
    ```
*   **Authentication:** Required.

### 2.3. Update User Learning Goals

*   **Method:** `PUT`
*   **Path:** `/users/me/goals`
*   **Description:** Updates or sets the learning goals for the authenticated user.
*   **Request Payload:**
    ```json
    {
      "learningGoals": [
        {"description": "Master advanced Python concepts"}, // New goal
        {"goalId": "goal-uuid-002", "description": "Understand data analysis fundamentals"} // Existing goal
      ]
    }
    ```
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "learningGoals": [
        {"goalId": "goal-uuid-003", "description": "Master advanced Python concepts"},
        {"goalId": "goal-uuid-002", "description": "Understand data analysis fundamentals"}
      ],
      "message": "Learning goals updated successfully."
    }
    ```
*   **Authentication:** Required.

---

## 3. Courses & Learning Paths

### 3.1. List Available Courses

*   **Method:** `GET`
*   **Path:** `/courses`
*   **Description:** Retrieves a list of all available courses. Supports basic pagination.
*   **Query Parameters:**
    *   `page` (integer, optional, default: 1)
    *   `limit` (integer, optional, default: 10)
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalCourses": 50,
        "limit": 10
      },
      "courses": [
        {
          "courseId": "crs-uuid-001",
          "title": "Introduction to Python",
          "description": "Learn the basics of Python programming.",
          "skillTags": ["Python", "Programming", "Beginner"]
        },
        {
          "courseId": "crs-uuid-002",
          "title": "Data Analysis with Pandas",
          "description": "Explore data analysis techniques using the Pandas library.",
          "skillTags": ["Python", "Data Analysis", "Pandas", "Intermediate"]
        }
      ]
    }
    ```
*   **Authentication:** Optional (publicly browsable).

### 3.2. Get Course Details

*   **Method:** `GET`
*   **Path:** `/courses/{courseId}`
*   **Description:** Retrieves details for a specific course, including its modules and lessons.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "courseId": "crs-uuid-001",
      "title": "Introduction to Python",
      "description": "Learn the basics of Python programming.",
      "skillTags": ["Python", "Programming", "Beginner"],
      "learningObjectives": ["Understand variables", "Write basic scripts"],
      "modules": [
        {
          "moduleId": "mod-uuid-101",
          "title": "Module 1: Python Setup",
          "lessons": [
            {"lessonId": "les-uuid-201", "title": "Lesson 1.1: Installing Python"},
            {"lessonId": "les-uuid-202", "title": "Lesson 1.2: Your First Script"}
          ]
        }
      ]
    }
    ```
*   **Authentication:** Optional.

### 3.3. Get Recommended Courses (Personalization Engine)

*   **Method:** `GET`
*   **Path:** `/users/me/recommendations/courses`
*   **Description:** Retrieves a list of recommended courses for the authenticated user based on their goals.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "recommendations": [
        {
          "courseId": "crs-uuid-001",
          "title": "Introduction to Python",
          "relevanceScore": 0.85 // From Personalization Engine
        },
        {
          "courseId": "crs-uuid-005",
          "title": "Object-Oriented Python",
          "relevanceScore": 0.72
        }
      ]
    }
    ```
*   **Authentication:** Required.

---

## 4. Learning Progression

### 4.1. Get Lesson Details

*   **Method:** `GET`
*   **Path:** `/lessons/{lessonId}`
*   **Description:** Retrieves the content for a specific lesson.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "lessonId": "les-uuid-201",
      "title": "Lesson 1.1: Installing Python",
      "contentType": "text_video", // e.g., text, video, quiz, interactive_exercise
      "contentData": {
        "text": "Detailed instructions on installing Python...",
        "videoUrl": "https://example.com/videos/python_install.mp4"
      },
      "quizId": "quiz-uuid-301" // Optional: ID of the quiz associated with this lesson
    }
    ```
*   **Authentication:** Required (user must be enrolled in the course).

### 4.2. Start/Mark Lesson as In Progress

*   **Method:** `POST`
*   **Path:** `/users/me/progress/lessons/{lessonId}/start`
*   **Description:** Marks a lesson as started or in progress for the authenticated user.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "lessonId": "les-uuid-201",
      "status": "in_progress",
      "message": "Lesson marked as in progress."
    }
    ```
*   **Authentication:** Required.

### 4.3. Complete Lesson Content (Pre-Quiz)

*   **Method:** `POST`
*   **Path:** `/users/me/progress/lessons/{lessonId}/completeContent`
*   **Description:** Marks the main content of a lesson as completed by the user (before taking any associated quiz). This triggers the Adaptive Content Delivery logic if no quiz follows, or prepares for quiz submission.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "lessonId": "les-uuid-201",
      "status": "content_completed",
      "nextStep": { // Provided by Adaptive Content Delivery Engine if no quiz
        "type": "next_lesson", // or "review_current", "remedial_content"
        "lessonId": "les-uuid-202", // if type is next_lesson or remedial_content
        "message": "Proceed to the next lesson."
      },
      "message": "Lesson content completed."
    }
    ```
*   **Authentication:** Required.

### 4.4. Submit Quiz Answers

*   **Method:** `POST`
*   **Path:** `/users/me/progress/quizzes/{quizId}/submit`
*   **Description:** Submits answers for a quiz associated with a lesson. Triggers Adaptive Content Delivery logic.
*   **Request Payload:**
    ```json
    {
      "lessonIdContext": "les-uuid-201", // Lesson this quiz attempt is for
      "answers": [
        {"questionId": "q-uuid-501", "answer": "A"},
        {"questionId": "q-uuid-502", "answer": "True"}
      ]
    }
    ```
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "quizId": "quiz-uuid-301",
      "userId": "user-uuid-12345",
      "score": 80.0, // Percentage
      "passed": true,
      "feedback": [
        {"questionId": "q-uuid-501", "correct": true, "correctAnswer": "A"},
        {"questionId": "q-uuid-502", "correct": false, "correctAnswer": "False", "explanation": "Explanation for Q2..."}
      ],
      "nextStep": { // Provided by Adaptive Content Delivery Engine
        "type": "next_lesson", // or "review_current", "remedial_content"
        "lessonId": "les-uuid-202", // if type is next_lesson or remedial_content
        "message": "Great job! Proceed to the next lesson."
      }
    }
    ```
*   **Authentication:** Required.

### 4.5. Get User Progress for a Course

*   **Method:** `GET`
*   **Path:** `/users/me/progress/courses/{courseId}`
*   **Description:** Retrieves the authenticated user's progress for a specific course.
*   **Request Payload:** None
*   **Response Payload (Success - 200 OK):**
    ```json
    {
      "userId": "user-uuid-12345",
      "courseId": "crs-uuid-001",
      "overallProgressPercent": 60.5,
      "completedLessons": ["les-uuid-201", "les-uuid-202"],
      "currentLesson": "les-uuid-203",
      "moduleStatus": [
        {"moduleId": "mod-uuid-101", "progressPercent": 100.0, "status": "completed"},
        {"moduleId": "mod-uuid-102", "progressPercent": 25.0, "status": "in_progress"}
      ]
    }
    ```
*   **Authentication:** Required.

---

This API specification covers the core functionalities for an MVP. Further endpoints would be needed for features like admin functionalities, more detailed content management, advanced user profile settings, and richer analytics as the platform evolves. Error handling details (specific status codes like 404, 500) are omitted for brevity but are essential.Finally, I'll create `Data_Storage_Choices.md`.
