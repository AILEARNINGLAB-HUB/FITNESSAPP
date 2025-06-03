# AI-Powered Adaptive Training Coach: MVP Test Plan

## 1. Introduction

This document outlines the test plan for the Minimum Viable Product (MVP) of the AI-Powered Adaptive Training Coach. The MVP focuses on core functionalities including user authentication, simplified onboarding, course recommendations (basic), lesson consumption, quiz-taking with rule-based adaptation, and basic progress tracking.

The purpose of this test plan is to:
- Verify that the core features function as intended.
- Ensure that the different components (frontend, backend, basic AI placeholders) integrate conceptually.
- Identify any critical issues before more complex features are built.

## 2. Conceptual Integration Review

This section reviews the integration points between the frontend, backend, and the conceptual AI components based on the generated specifications and code structure.

### 2.1. API Endpoint Check

**Comparison:**
- `API_Specifications.md` (Design)
- Backend Routes (`auth_routes.py`, `user_routes.py`) (Implementation Report)
- Frontend `api.js` (Implementation)

**Discrepancies & Points of Attention:**

1.  **User Learning Goals Endpoints:**
    *   **API Spec:** Defines `GET /users/me/goals` and `PUT /users/me/goals`.
    *   **Backend Routes:** These specific routes were not explicitly created in the backend generation task (which focused on `/auth/*` and `/users/me`). **ATTENTION:** These backend routes need to be implemented.
    *   **Frontend `api.js`:** `getUserLearningGoals()` and `updateUserLearningGoals()` have placeholder console warnings due to the missing backend.

2.  **Course Endpoints:**
    *   **API Spec:** Defines `GET /courses`, `GET /courses/{courseId}`.
    *   **Backend Routes:** Course routes (`course_routes.py`) were mentioned as a placeholder in `backend/app/__init__.py` but not implemented. **ATTENTION:** These backend routes need to be implemented.
    *   **Frontend `api.js`:** `listAvailableCourses()` and `getCourseDetails()` are defined and expect these endpoints.

3.  **Lesson & Quiz Endpoints:**
    *   **API Spec:** Defines `GET /lessons/{lessonId}`, `POST /users/me/progress/lessons/{lessonId}/start`, `POST /users/me/progress/lessons/{lessonId}/completeContent`, `POST /users/me/progress/quizzes/{quizId}/submit`.
    *   **Backend Routes:** These progression-related routes were not implemented in the backend generation task. **ATTENTION:** These backend routes are critical for core functionality and need to be implemented.
    *   **Frontend `api.js`:** Corresponding functions exist (`getLessonDetails`, `startLesson`, `completeLessonContent`, `submitQuiz`).

4.  **Progress Endpoint:**
    *   **API Spec:** Defines `GET /users/me/progress/courses/{courseId}`.
    *   **Backend Routes:** Not implemented. **ATTENTION:** Needs implementation.
    *   **Frontend `api.js`:** `getUserCourseProgress()` exists.

**Summary of API Check:** The frontend `api.js` aligns well with `API_Specifications.md`. However, the backend route implementation in the initial generation task was limited to auth and basic user profile. Significant backend work is needed to implement the course, lesson, quiz, and progress endpoints as defined in the API specifications to enable frontend functionality.

### 2.2. Data Flow for Recommendations

1.  **Frontend (Onboarding/Profile Update):** User sets learning interests/goals (e.g., "Learn Python programming basics"). This data is captured by `frontend/js/main.js` (e.g., `initOnboardingPage`).
2.  **Frontend (API Call):** `updateUserLearningGoals()` (in `frontend/js/api.js`) would send this data to the (currently missing) backend endpoint `PUT /api/users/me/goals`.
3.  **Backend (Controller/Route):** The (missing) route for `PUT /api/users/me/goals` would receive the goals.
4.  **Backend (Service - e.g., `UserService`):** The `user_service.py` would have a method to process and store these goals, likely in the `UserGoal` model.
5.  **Frontend (Dashboard Load):** When the dashboard loads, `loadDashboardData()` in `frontend/js/main.js` calls `getRecommendedCourses()` from `frontend/js/api.js`.
6.  **Frontend (API Call):** This makes a `GET` request to `/api/users/me/recommendations/courses`.
7.  **Backend (Controller/Route):** A (to-be-created) route, likely in `course_routes.py` or a dedicated `recommendation_routes.py`, handles this request.
8.  **Backend (Service - e.g., `RecommendationService` or `CourseService`):**
    *   This service method would first fetch the current user's stored learning goals (from `UserGoal` model via `UserService`).
    *   It would then fetch course data (titles, descriptions, skill tags from `Course` model).
    *   It instantiates `PersonalizationEngineMVP` from `aiml.core.personalization_engine` with the course data.
    *   It calls `personalization_engine.recommend_courses(user_goals_text=formatted_user_goals, top_n=5)`.
    *   The list of recommended course IDs (and scores) is returned.
9.  **Backend (Controller/Route):** The route formats this list (likely enriching with course titles/descriptions) and sends it as a JSON response.
10. **Frontend (UI Update):** `loadDashboardData()` receives the recommendations and uses `renderRecommendedCourses()` from `frontend/js/ui_render.js` to display them.

### 2.3. Data Flow for Adaptation

1.  **Frontend (Quiz Submission):** User answers quiz questions in `quiz_view.html`. `handleQuizSubmission()` in `frontend/js/main.js` collects answers.
2.  **Frontend (API Call):** `submitQuiz(quizId, lessonIdContext, answers)` from `frontend/js/api.js` sends a `POST` request to `/api/users/me/progress/quizzes/{quizId}/submit`.
3.  **Backend (Controller/Route):** A (to-be-created) route, likely in a `progress_routes.py` or `quiz_routes.py`, handles this request.
4.  **Backend (Service - e.g., `ProgressService` or `QuizService`):**
    *   This service method validates the submission.
    *   It calculates the `quiz_score` based on the submitted answers and correct answers (which need to be stored with the Quiz/Question models).
    *   It records the quiz attempt (e.g., in a `UserQuizAttempt` model).
    *   It then instantiates `AdaptiveEngineMVP` from `aiml.core.adaptive_engine`.
    *   It calls `adaptive_engine.get_next_action(user_id=current_user.id, lesson_id=lessonIdContext, quiz_score=calculated_score, lesson_content_completed=True)`.
    *   The `action` dictionary (e.g., `{'action': 'REVIEW_LESSON_MATERIAL', ...}`) is received from the engine.
5.  **Backend (Controller/Route):** The route includes this `action` dictionary (referred to as `nextStep` in API spec) in the JSON response, along with score and feedback.
6.  **Frontend (UI Update):** `handleQuizSubmission()` receives the API response. It navigates to the quiz results view and calls `renderQuizResults()` from `frontend/js/ui_render.js`, passing the entire result including the `nextStep` data.
7.  **Frontend (User Action):** The `quiz_results.html` (via its template in `index.html`) will have a button (e.g., "Next Lesson" or "Review Lesson"). Event listeners in `main.js` for this button will use the `nextStep` data to determine the next hash/page to navigate to (e.g., `#lesson/lesson-to-review-id` or `#lesson/next-lesson-id`).

### 2.4. AI Component Invocation (Backend)

*   **`PersonalizationEngineMVP` Invocation:**
    *   **Location:** A new service, e.g., `RecommendationService` (in `backend/app/services/recommendation_service.py`) or within an expanded `CourseService`.
    *   **Method:** `get_course_recommendations(user_id)`
        1.  Fetch user's learning goals (e.g., from `UserGoal` via `UserService`).
        2.  Fetch all relevant course data (e.g., `Course.query.all()`, selecting `id`, `title`, `description`, `skillTags`). Convert to list of dicts.
        3.  `engine = PersonalizationEngineMVP(courses_data=all_courses_list)`
        4.  `formatted_goals = " ".join([goal.goal_description for goal in user_goals])`
        5.  `recommendations = engine.recommend_courses(user_goals_text=formatted_goals, top_n=5)`
        6.  Return recommendations (potentially enriched with full course details).
    *   **Called by:** The backend route handling `GET /api/users/me/recommendations/courses`.

*   **`AdaptiveEngineMVP` Invocation:**
    *   **Location:** A new service, e.g., `ProgressService` (in `backend/app/services/progress_service.py`) or `QuizService`.
    *   **Method:** `process_quiz_submission(user_id, quiz_id, lesson_id_context, answers)`
        1.  Calculate `quiz_score` based on `answers` against stored correct answers for `quiz_id`.
        2.  Store the quiz attempt and score.
        3.  `engine = AdaptiveEngineMVP()`
        4.  `next_action_data = engine.get_next_action(user_id=user_id, lesson_id=lesson_id_context, quiz_score=quiz_score, lesson_content_completed=True)`
        5.  Return `quiz_score`, feedback, and `next_action_data`.
    *   **Called by:** The backend route handling `POST /api/users/me/progress/quizzes/{quizId}/submit`.
    *   A similar call could be made from a service method handling `POST /users/me/progress/lessons/{lessonId}/completeContent` if the lesson has no quiz, passing `lesson_content_completed=True` and `quiz_score=None`.


## 3. Test Environment Setup (Conceptual)

*   **Backend:** Run `python backend/run.py` (Flask development server). Ensure environment variables for `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY` are set (e.g., in a `.env` file).
*   **Frontend:** Serve the `frontend/` directory using a simple HTTP server (e.g., `python -m http.server 8000` from within the `frontend` directory, or Live Server VSCode extension). Access via `http://localhost:8000`.
*   **Database:**
    *   For MVP with SQLite: The `adaptive_coach_mvp.db` file will be created/used in the `backend` directory (or as specified in `DATABASE_URL`).
    *   Initialize schema: Run `flask db init` (once per project), `flask db migrate -m "initial_migration"`, `flask db upgrade` from the `backend` directory. Or use `flask initdb` if not using complex migrations initially.
*   **AI Components:** The Python scripts in `aiml/` will be imported by the backend services. No separate serving process is needed for them for MVP as they are direct class instantiations.
*   **Browser:** Any modern web browser (Chrome, Firefox, Edge). Developer tools will be essential for inspecting requests, responses, and console logs.

## 4. Prerequisites for Testing

*   **Sample Users:**
    *   `new_user_1@example.com` (for testing registration and onboarding).
    *   `test_user_progress@example.com` (pre-registered, enrolled in 1-2 courses, some lessons completed, one quiz attempted).
    *   `test_user_completed@example.com` (pre-registered, one course fully completed).
*   **Sample Course Data (to be populated in the database):**
    *   **Course C01: "Python Basics"**
        *   ID: `py001`
        *   Description: "Fundamentals of Python."
        *   Skill Tags: ["python", "beginner", "programming"]
        *   Modules/Lessons (conceptual, actual structure depends on DB models for Lesson/Module):
            *   Module M1: "Introduction"
                *   Lesson L1.1: "What is Python?" (Content only)
                *   Lesson L1.2: "Variables" (Content + Quiz QZ01)
            *   Module M2: "Control Flow"
                *   Lesson L2.1: "If Statements" (Content only)
    *   **Course C02: "Data Analysis Introduction"**
        *   ID: `da001`
        *   Description: "Introduction to Data Analysis concepts."
        *   Skill Tags: ["data analysis", "beginner", "statistics"]
        *   Modules/Lessons:
            *   Module M1DA: "Core Concepts"
                *   Lesson L1.1DA: "Types of Data" (Content only)
    *   **Quiz QZ01 (for Lesson L1.2 of C01):**
        *   Title: "Variables Quiz"
        *   Pass Thresholds (conceptual for `AdaptiveEngineMVP`): low 0.5, high 0.8
        *   Questions (example):
            *   Q1: "What keyword is used to define a variable in Python?" (Correct: No specific keyword, just assignment)
            *   Q2: "Is `x = 10` a valid Python variable assignment?" (Correct: Yes)

## 5. Test Cases

### 5.1. Authentication

| Test Case ID | Feature         | Test Scenario                    | Test Steps                                                                                                                               | Expected Result                                                                                                   | Actual Result | Status   |
|--------------|-----------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_AUTH_001  | Authentication  | Successful User Registration     | 1. Navigate to Register page. 2. Fill in First Name, Last Name, Email (`new_user_1@example.com`), Password. 3. Click "Register".         | User is registered. Message "Registration successful!" shown. Redirected to Login page or Dashboard (if auto-login). |               |          |
| TC_AUTH_002  | Authentication  | Registration with Existing Email | 1. Navigate to Register page. 2. Fill in email `test_user_progress@example.com` (pre-existing) and other fields. 3. Click "Register". | Error message "Email already registered." is displayed.                                                            |               |          |
| TC_AUTH_003  | Authentication  | Successful Login                 | 1. Navigate to Login page. 2. Enter email `test_user_progress@example.com` and correct password. 3. Click "Login".                       | User is logged in. Redirected to Dashboard. Main navigation is visible.                                            |               |          |
| TC_AUTH_004  | Authentication  | Login with Incorrect Password    | 1. Navigate to Login page. 2. Enter email `test_user_progress@example.com` and incorrect password. 3. Click "Login".                   | Error message "Invalid email or password." is displayed.                                                            |               |          |
| TC_AUTH_005  | Authentication  | Login with Non-existent Email    | 1. Navigate to Login page. 2. Enter email `no_such_user@example.com` and any password. 3. Click "Login".                               | Error message "Invalid email or password." is displayed.                                                            |               |          |
| TC_AUTH_006  | Authentication  | Logout                           | 1. Log in successfully. 2. Click "Logout" link in navigation.                                                                              | User is logged out. Redirected to Login page. Main navigation is hidden.                                           |               |          |

### 5.2. Onboarding & Profile

| Test Case ID | Feature         | Test Scenario                       | Test Steps                                                                                                                              | Expected Result                                                                                               | Actual Result | Status   |
|--------------|-----------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_ONB_001   | Onboarding      | Complete Simplified Onboarding      | 1. Register a new user. 2. After registration (or first login), user is taken to Onboarding. 3. Select 1-2 interests. 4. Click "Complete Setup". | Interests are saved (conceptually). User is redirected to Dashboard.                                          |               |          |
| TC_PROF_001  | User Profile    | View User Profile (Placeholder)     | 1. Log in. 2. Navigate to Profile page (if link exists).                                                                                  | Basic profile page placeholder content is displayed.                                                            |               |          |
| TC_PROF_002  | User Profile    | Update User Profile (Placeholder)   | 1. Log in. 2. Navigate to Profile page. 3. (If form exists) Update First Name, Last Name. 4. Click "Save".                                 | (If implemented) Profile data is updated. Confirmation shown. (For MVP, this might be a very basic form).     |               |          |

### 5.3. Dashboard & Recommendations

| Test Case ID | Feature         | Test Scenario                    | Test Steps                                                                                                    | Expected Result                                                                                                    | Actual Result | Status   |
|--------------|-----------------|----------------------------------|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_DASH_001  | Dashboard       | View Dashboard After Login       | 1. Log in successfully.                                                                                       | Dashboard page is displayed. "Recommended Courses" and "My Learning" sections are visible.                           |               |          |
| TC_DASH_002  | Recommendations | Recommended Courses Displayed    | 1. Log in as user with set interests (e.g., after onboarding). 2. View Dashboard.                               | "Recommended Courses" section shows a list of courses (even if dummy/static for initial tests, based on interests). |               |          |
| TC_DASH_003  | My Learning     | "My Learning" Section (No Courses)| 1. Log in as a new user who hasn't started any courses. 2. View Dashboard.                                    | "My Learning" section shows a message like "No courses in progress."                                                 |               |          |
| TC_DASH_004  | My Learning     | "My Learning" Section (With Course)| 1. Log in as `test_user_progress@example.com`. 2. View Dashboard.                                           | "My Learning" section lists "Python Basics" as in progress.                                                        |               |          |

### 5.4. Course Navigation & Consumption

| Test Case ID | Feature         | Test Scenario                         | Test Steps                                                                                                                             | Expected Result                                                                                                                               | Actual Result | Status   |
|--------------|-----------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_CRS_001   | Course          | View Course Details                   | 1. Log in. 2. On Dashboard, click "View Details" on a recommended course (e.g., C01 "Python Basics").                                   | Course Detail page for C01 is displayed, showing title, description, and list of modules/lessons (L1.1, L1.2, L2.1). "Start Course" button visible. |               |          |
| TC_CRS_002   | Course          | Start a Course / View First Lesson    | 1. On Course Detail page for C01, click "Start Course" (or "Start/View First Lesson").                                                   | User is navigated to Lesson View page for L1.1 "What is Python?". Content is displayed.                                                        |               |          |
| TC_LES_001   | Lesson          | Navigate to Next Lesson (No Quiz)     | 1. On Lesson View for L1.1. 2. Click "Next Lesson" (or "Mark Complete & Next Lesson").                                                   | User is navigated to Lesson View for L1.2 "Variables".                                                                                        |               |          |
| TC_LES_002   | Lesson          | Navigate to Previous Lesson           | 1. After navigating to L1.2, click "Previous Lesson".                                                                                  | User is navigated back to Lesson View for L1.1.                                                                                               |               |          |

### 5.5. Quiz Taking & Basic Adaptation

| Test Case ID | Feature         | Test Scenario                       | Test Steps                                                                                                                                                              | Expected Result                                                                                                                                                                 | Actual Result | Status   |
|--------------|-----------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_QUIZ_001  | Quiz            | Navigate to Quiz from Lesson        | 1. On Lesson View for L1.2 ("Variables"). 2. Click "Go to Quiz".                                                                                                          | User is navigated to Quiz View page for QZ01. Quiz questions are displayed.                                                                                                     |               |          |
| TC_QUIZ_002  | Quiz            | Submit Quiz & Pass (High Score)     | 1. On Quiz View for QZ01. 2. Answer questions correctly (e.g., achieve >80%). 3. Click "Submit Quiz".                                                                       | Quiz Results page is displayed. Score is shown (e.g., >80%). Feedback message is positive ("Excellent!"). "Next Lesson" button is prominent.                                    |               |          |
| TC_QUIZ_003  | Quiz            | Submit Quiz & Pass (Medium Score)   | 1. On Quiz View for QZ01. 2. Answer questions to achieve a medium score (e.g., 50-79%). 3. Click "Submit Quiz".                                                              | Quiz Results page is displayed. Score is shown. Feedback message is moderate ("Good job!"). "Next Lesson" button is prominent.                                                   |               |          |
| TC_QUIZ_004  | Quiz            | Submit Quiz & Fail (Low Score)      | 1. On Quiz View for QZ01. 2. Answer questions incorrectly (e.g., achieve <50%). 3. Click "Submit Quiz".                                                                    | Quiz Results page is displayed. Score is shown. Feedback message suggests review ("Your score...suggests this topic needs more review..."). "Review Lesson" button is prominent. |               |          |
| TC_QUIZ_005  | Quiz Adaptation | Act on "Review Lesson"              | 1. After failing quiz (TC_QUIZ_004), click "Review Lesson" button on Quiz Results page.                                                                                   | User is navigated back to the Lesson View for L1.2 ("Variables").                                                                                                               |               |          |
| TC_QUIZ_006  | Quiz Adaptation | Act on "Next Lesson" after Passing  | 1. After passing quiz (e.g., TC_QUIZ_002), click "Next Lesson" button on Quiz Results page.                                                                               | User is navigated to the next lesson in the course (L2.1 "If Statements").                                                                                                      |               |          |

### 5.6. Progress Tracking (Simplified)

| Test Case ID | Feature         | Test Scenario                       | Test Steps                                                                                                                             | Expected Result                                                                                                                                  | Actual Result | Status   |
|--------------|-----------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|---------------|----------|
| TC_PROG_001  | Progress        | View "My Progress" Page             | 1. Log in as `test_user_progress@example.com`. 2. Navigate to "My Progress" page.                                                        | "In Progress" section lists C01 "Python Basics" with a progress percentage. "Completed" section might be empty or list other completed courses. |               |          |
| TC_PROG_002  | Progress        | Course Completion Status (Conceptual)| 1. Log in as `test_user_completed@example.com`. 2. Navigate to "My Progress" page.                                                      | (Assuming C02 was completed) "Completed" section lists C02 "Data Analysis Introduction" with a completion date.                                  |               |          |

## 6. Post-MVP Testing Notes

As the AI-Powered Adaptive Training Coach evolves, testing will need to expand to cover:
-   **Advanced Personalization:** Effectiveness of more sophisticated recommendation algorithms (e.g., collaborative filtering, hybrid models). A/B testing different algorithms.
-   **Complex Adaptive Logic:** Testing various paths through adaptive content, different difficulty adjustments, and feedback mechanisms.
-   **Diverse Content Types:** Testing with video, interactive exercises, and other rich media.
-   **Full User Profile Features:** All aspects of profile management, goal setting, and preference updates.
-   **Assessment Variations:** Different question types in quizzes, open-ended responses (if NLP is added).
-   **Analytics & Reporting:** Verification of data collected for analytics and the accuracy of reports.
-   **Scalability & Performance Testing:** Ensuring the system handles a growing number of users, courses, and interactions.
-   **Security Testing:** In-depth vulnerability assessments.
-   **Accessibility Testing:** Comprehensive testing against WCAG guidelines.
-   **Cross-browser & Cross-device Testing:** Ensuring consistent experience on various platforms.
-   **Admin Functionalities:** Content management, user management, etc.

This initial test plan provides a starting point for ensuring the quality and functionality of the MVP. It should be updated dynamically as development progresses.
