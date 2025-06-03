document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const appContent = document.getElementById('app-content');
    const mainNav = document.getElementById('main-nav');

    const routes = {
        'login': 'login-template',
        'register': 'register-template',
        'onboarding': 'onboarding-template',
        'dashboard': 'dashboard-template',
        'course': 'course-detail-template', // Expects an ID, e.g., #course/course-uuid-123
        'lesson': 'lesson-view-template',   // Expects an ID, e.g., #lesson/lesson-uuid-abc
        'quiz': 'quiz-view-template',       // Expects an ID, e.g., #quiz/quiz-uuid-xyz
        'quiz_results': 'quiz-results-template', // Expects data, or an ID
        'my_progress': 'my-progress-template',
        // Placeholders from index.html for completeness, might not be fully wired
        'courses': 'courses-template',
        'profile': 'profile-template'
    };

    function navigateTo(hash) {
        const [page, param] = hash.substring(1).split('/'); // Remove #, split path like "course/id"
        const templateId = routes[page];

        if (!templateId) {
            console.error('No template found for page:', page);
            // Fallback to login or dashboard depending on auth state
            loadPage(auth.isAuthenticated() ? 'dashboard' : 'login');
            return;
        }

        const template = document.getElementById(templateId);
        if (template) {
            appContent.innerHTML = template.innerHTML;
            console.log(`Navigated to ${page}, param: ${param}`);
            // After loading template, execute page-specific logic
            loadPageSpecificContent(page, param);
        } else {
            console.error('Template not found in DOM:', templateId);
            appContent.innerHTML = '<p>Error: Page template not found.</p>';
        }
    }

    async function loadPageSpecificContent(page, param) {
        // Clear previous errors/messages if any global ones exist
        // clearError('global-error');
        switch (page) {
            case 'login':
                initLoginPage();
                break;
            case 'register':
                initRegisterPage();
                break;
            case 'onboarding':
                initOnboardingPage();
                break;
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'course':
                if (param) await loadCourseDetailPage(param); // param is courseId
                break;
            case 'lesson':
                if (param) await loadLessonPage(param); // param is lessonId
                break;
            case 'quiz':
                if (param) await loadQuizPage(param); // param is quizId
                break;
            // quiz_results might be loaded directly after quiz submission, not via hash
            case 'my_progress':
                await loadMyProgressPage();
                break;
            // Add cases for other pages like 'courses', 'profile'
        }
        // Re-attach global event listeners if needed, or use event delegation
        attachDynamicEventListeners();
    }

    function updateNavVisibility() {
        if (auth.isAuthenticated()) {
            mainNav.classList.remove('hidden');
        } else {
            mainNav.classList.add('hidden');
        }
    }

    // --- Page Specific Loaders and Initializers ---
    function initLoginPage() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearError('login-error');
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                try {
                    await auth.login(email, password);
                    updateNavVisibility();
                    window.location.hash = '#dashboard';
                } catch (error) {
                    displayError('login-error', error.message || 'Login failed. Please try again.');
                }
            });
        }
    }

    function initRegisterPage() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearError('register-error');
                const userData = {
                    firstName: document.getElementById('register-firstname').value,
                    lastName: document.getElementById('register-lastname').value,
                    email: document.getElementById('register-email').value,
                    password: document.getElementById('register-password').value,
                };
                try {
                    await auth.register(userData);
                    // Redirect to login or show success and ask to login
                    alert('Registration successful! Please login.'); // Simple alert for MVP
                    window.location.hash = '#login';
                } catch (error) {
                    displayError('register-error', error.message || 'Registration failed. Please try again.');
                }
            });
        }
    }

    function initOnboardingPage() {
        const onboardingForm = document.getElementById('onboarding-form');
        if(onboardingForm) {
            onboardingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const selectedInterests = Array.from(onboardingForm.querySelectorAll('input[name="interest"]:checked'))
                                             .map(cb => cb.value);
                console.log('Selected interests:', selectedInterests);
                // For MVP, we might just store this locally or send to a simplified backend endpoint
                // This assumes updateUserLearningGoals can handle this format or is adapted
                try {
                    // await updateUserLearningGoals({ learningGoals: selectedInterests.map(desc => ({ description: desc })) });
                    alert('Onboarding complete! (Simulated goal update)');
                    window.location.hash = '#dashboard';
                } catch (error) {
                    console.error("Failed to save onboarding goals:", error);
                    alert('Could not save preferences. Proceeding to dashboard.');
                    window.location.hash = '#dashboard';
                }
            });
        }
    }

    async function loadDashboardData() {
        try {
            const recommended = await getRecommendedCourses(); // from api.js
            renderRecommendedCourses(recommended.recommendations || recommended); // Adapt based on actual API response structure

            // Placeholder for "My Learning" - In Progress courses
            // const inProgressCourses = await getInProgressCourses(); // Needs API endpoint
            // renderUserCourses(inProgressCourses, 'mylearning-list', 'in-progress');
            // For MVP, just show placeholder if API not ready
             renderUserCourses([], 'mylearning-list', 'in-progress');


        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            if (document.getElementById('recommended-list')) {
                document.getElementById('recommended-list').innerHTML = '<p class="error-message">Could not load recommendations.</p>';
            }
        }
    }

    async function loadCourseDetailPage(courseId) {
        try {
            const courseData = await getCourseDetails(courseId); // from api.js
            renderCourseDetail(courseData);
        } catch (error) {
            console.error('Failed to load course details:', error);
            appContent.innerHTML = `<p class="error-message">Could not load course details for ID ${courseId}.</p>`;
        }
    }

    async function loadLessonPage(lessonId) {
        try {
            // Mark lesson as started (optional, backend might handle this implicitly)
            // await startLesson(lessonId);
            const lessonData = await getLessonDetails(lessonId); // from api.js
            renderLessonView(lessonData);
        } catch (error) {
            console.error('Failed to load lesson:', error);
            appContent.innerHTML = `<p class="error-message">Could not load lesson ID ${lessonId}.</p>`;
        }
    }

    async function loadQuizPage(quizId) {
        try {
            // Fetch quiz questions from a hypothetical endpoint or assume they are part of lesson data
            // For MVP, quiz data might be hardcoded or part of lesson detail
            // const quizData = await getQuizDetails(quizId);
            const placeholderQuizData = {
                quizId: quizId,
                title: `Quiz for ${quizId}`,
                questions: [
                    { questionId: "q1", text: "What is 2+2?", options: [{id: "a", text: "3"}, {id: "b", text: "4"}, {id: "c", text: "5"}]},
                    { questionId: "q2", text: "Is Python a programming language?", options: [{id: "a", text: "Yes"}, {id: "b", text: "No"}]}
                ]
            };
            renderQuizView(placeholderQuizData);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            appContent.innerHTML = `<p class="error-message">Could not load quiz ID ${quizId}.</p>`;
        }
    }

    async function handleQuizSubmission(quizId) {
        const form = document.querySelector('#quiz-view-page form, #quiz-questions-container'); // Adjust selector
        if (!form) {
            console.error('Quiz form not found');
            return;
        }

        const answers = [];
        // Assuming questions are rendered with inputs like name="question_q1" value="opt_a"
        const questionsRendered = form.querySelectorAll('.question');
        questionsRendered.forEach(qDiv => {
            const questionId = qDiv.id.replace('question-', '');
            const selectedOption = qDiv.querySelector(`input[name="question_${questionId}"]:checked`);
            if (selectedOption) {
                answers.push({ questionId: questionId, answer: selectedOption.value });
            } else {
                answers.push({ questionId: questionId, answer: null }); // Or handle unanswered
            }
        });

        try {
            // lessonIdContext is needed by API, this needs to be available, e.g. from when quiz was loaded
            const lessonIdContext = document.getElementById('quiz-view-page')?.dataset.lessonId || 'unknown_lesson';
            const results = await submitQuiz(quizId, lessonIdContext, answers); // from api.js

            // Navigate to results page (template load)
            const template = document.getElementById(routes['quiz_results']);
            if (template) {
                appContent.innerHTML = template.innerHTML;
                renderQuizResults(results); // from ui_render.js
            }
        } catch (error) {
            console.error('Quiz submission failed:', error);
            alert(`Error submitting quiz: ${error.message}`);
        }
    }

    async function loadMyProgressPage() {
        try {
            // This would require API endpoints to fetch all enrolled and completed courses
            // For MVP, using placeholder data
            const placeholderProgress = {
                inProgress: [
                    // Example: { courseId: "crs-uuid-001", title: "Introduction to Python", overallProgressPercent: 60 }
                ],
                completed: [
                    // Example: { courseId: "crs-uuid-000", title: "Onboarding Basics", completionDate: "2023-01-15T..." }
                ]
            };
            // const userProgress = await getUserAllCourseProgress(); // Needs API
            renderMyProgress(placeholderProgress);
        } catch (error) {
            console.error("Failed to load progress:", error);
            document.getElementById('my-progress-page').innerHTML = '<p class="error-message">Could not load progress.</p>';
        }
    }


    // --- Event Delegation for dynamically loaded content ---
    function attachDynamicEventListeners() {
        appContent.addEventListener('click', async (e) => {
            // View Course Details Button
            if (e.target.classList.contains('view-course-details-btn') || e.target.closest('.view-course-details-btn')) {
                const button = e.target.closest('.view-course-details-btn');
                const courseId = button.dataset.courseId;
                if (courseId) window.location.hash = `#course/${courseId}`;
            }
            // Lesson Link
            else if (e.target.classList.contains('lesson-link') || e.target.closest('.lesson-link')) {
                const link = e.target.closest('.lesson-link');
                const lessonId = link.dataset.lessonId;
                if (lessonId) window.location.hash = `#lesson/${lessonId}`;
            }
            // Start/Resume Course Button (on Course Detail Page)
            else if (e.target.id === 'start-resume-course-btn') {
                const courseId = e.target.dataset.courseId;
                // For MVP, assume it always goes to the first lesson or a known lesson.
                // A real app would fetch course structure to find the first/next lesson.
                // This needs API to give first lesson ID of a course.
                alert(`Starting/Resuming course ${courseId}. Needs first lesson ID from backend.`);
                // Example: window.location.hash = `#lesson/first-lesson-of-${courseId}`;
            }
            // Lesson Navigation Buttons
            else if (e.target.id === 'next-lesson-btn-or-quiz') {
                const action = e.target.dataset.action;
                const lessonId = e.target.dataset.lessonId;
                if (action === 'go_to_quiz') {
                    const quizId = e.target.dataset.quizId;
                    window.location.hash = `#quiz/${quizId}`;
                    // Pass lessonId context if needed for quiz page
                    setTimeout(() => { // Ensure quiz page is loaded before setting dataset
                         const quizPageEl = document.getElementById('quiz-view-page');
                         if(quizPageEl) quizPageEl.dataset.lessonId = lessonId;
                    },0);

                } else if (action === 'complete_lesson_no_quiz') {
                    try {
                        const result = await completeLessonContent(lessonId);
                        // Use result.nextStep.lessonId to navigate
                        alert(`Lesson ${lessonId} completed. Next lesson: ${result.nextStep?.lessonId || 'N/A (End of course?)'}`);
                        if(result.nextStep?.lessonId) window.location.hash = `#lesson/${result.nextStep.lessonId}`;
                        // else handle end of course
                    } catch (error) {
                        alert(`Error completing lesson: ${error.message}`);
                    }
                }
            }
            else if (e.target.id === 'prev-lesson-btn') {
                // Needs logic to find previous lesson ID
                alert('Previous lesson functionality not fully implemented for MVP.');
            }
            // Submit Quiz Button
            else if (e.target.id === 'submit-quiz-btn') {
                const quizId = e.target.dataset.quizId;
                if (quizId) await handleQuizSubmission(quizId);
            }
            // Quiz Results Next Action Button
            else if (e.target.id === 'quiz-results-next-action-btn') {
                const nextActionType = e.target.dataset.nextAction;
                const lessonId = e.target.dataset.lessonId; // Could be current or next
                if (nextActionType === 'REVIEW_LESSON_MATERIAL') {
                    window.location.hash = `#lesson/${lessonId}`; // Assumes lessonId is for the lesson to review
                } else if (nextActionType && nextActionType.startsWith('PROCEED_NEXT_LESSON')) {
                    // This needs the actual *next* lesson ID from the backend's nextStep object
                    alert("Proceeding to next lesson (placeholder - needs next lesson ID)");
                    // window.location.hash = `#lesson/ACTUAL_NEXT_LESSON_ID`;
                } else {
                    window.location.hash = '#dashboard'; // Fallback
                }
            }
        });
    }

    // --- Initial Setup ---
    // Main navigation links
    mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.page) {
            e.preventDefault();
            const page = e.target.dataset.page;
            window.location.hash = `#${page}`;
        }
    });

    // Logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            updateNavVisibility();
            window.location.hash = '#login';
        });
    }

    // Handle hash changes for navigation
    window.addEventListener('hashchange', () => navigateTo(window.location.hash));

    // Initial page load logic
    updateNavVisibility();
    if (auth.isAuthenticated()) {
        // If there's a hash, navigate there, otherwise to dashboard
        navigateTo(window.location.hash || '#dashboard');
    } else {
        // If not authenticated, force to login unless already on register page
        if (window.location.hash === '#register') {
            navigateTo('#register');
        } else {
            navigateTo('#login');
        }
    }
});

console.log('main.js loaded');
