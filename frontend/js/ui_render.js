// --- General UI Helper ---
function clearElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block'; // Make it visible
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none'; // Hide it
    }
}

// --- Specific Page/Component Renders ---

function renderRecommendedCourses(courses, targetElementId = 'recommended-list') {
    const listElement = document.getElementById(targetElementId);
    if (!listElement) {
        console.warn(`Element with ID '${targetElementId}' not found for recommendations.`);
        return;
    }
    if (!courses || courses.length === 0) {
        listElement.innerHTML = '<p>No recommendations available at the moment.</p>';
        return;
    }
    listElement.innerHTML = courses.map(course => `
        <div class="course-item" data-course-id="${course.courseId}">
            <h3>${course.title}</h3>
            <p>Relevance: ${course.relevanceScore || 'N/A'}</p>
            <button class="view-course-details-btn" data-course-id="${course.courseId}">View Details</button>
        </div>
    `).join('');
}

function renderUserCourses(courses, targetElementId = 'mylearning-list', type = 'in-progress') {
    const listElement = document.getElementById(targetElementId);
    if (!listElement) {
        console.warn(`Element with ID '${targetElementId}' not found for user courses.`);
        return;
    }
    if (!courses || courses.length === 0) {
        listElement.innerHTML = `<p>No courses ${type === 'in-progress' ? 'in progress' : 'completed'} yet.</p>`;
        return;
    }
    listElement.innerHTML = courses.map(course => `
        <div class="course-item" data-course-id="${course.courseId}">
            <h3>${course.title}</h3>
            ${type === 'in-progress' ? `<p>Progress: ${course.overallProgressPercent || 0}%</p>` : ''}
            ${type === 'completed' ? `<p>Completed: ${new Date(course.completionDate).toLocaleDateString() || 'N/A'}</p>` : ''}
            <button class="view-course-details-btn" data-course-id="${course.courseId}">${type === 'in-progress' ? 'Resume' : 'Review'} Course</button>
        </div>
    `).join('');
}


function renderCourseDetail(courseData, targetTitleId = 'course-detail-title', targetDescriptionId = 'course-detail-description', targetModulesListId = 'course-modules-list') {
    const titleElement = document.getElementById(targetTitleId);
    const descriptionElement = document.getElementById(targetDescriptionId);
    const modulesListElement = document.getElementById(targetModulesListId);
    const startResumeBtn = document.getElementById('start-resume-course-btn');


    if (titleElement) titleElement.textContent = courseData.title || 'Course Title';
    if (descriptionElement) descriptionElement.textContent = courseData.description || 'No description available.';
    if (startResumeBtn) {
        startResumeBtn.dataset.courseId = courseData.courseId;
        // Logic to change text to "Resume" or "Review" based on enrollment status would go here
        // For MVP, it can just be "Start/View Course"
        startResumeBtn.textContent = "Start/View First Lesson";
    }

    if (modulesListElement) {
        if (courseData.modules && courseData.modules.length > 0) {
            modulesListElement.innerHTML = courseData.modules.map(module => `
                <div class="module-item">
                    <h4>${module.title}</h4>
                    <ul class="lesson-list">
                        ${module.lessons ? module.lessons.map(lesson => `
                            <li><a href="#lesson/${lesson.lessonId}" class="lesson-link" data-lesson-id="${lesson.lessonId}">${lesson.title}</a></li>
                        `).join('') : '<li>No lessons in this module.</li>'}
                    </ul>
                </div>
            `).join('');
        } else {
            modulesListElement.innerHTML = '<p>No modules available for this course.</p>';
        }
    }
}

function renderLessonView(lessonData, titleTargetId = 'lesson-title', contentTargetId = 'lesson-content-area') {
    const titleElement = document.getElementById(titleTargetId);
    const contentElement = document.getElementById(contentTargetId);
    const nextButton = document.getElementById('next-lesson-btn-or-quiz');
    const prevButton = document.getElementById('prev-lesson-btn');


    if (titleElement) titleElement.textContent = lessonData.title || 'Lesson Title';
    if (contentElement) {
        // For MVP, assuming contentData has a 'text' field and maybe 'videoUrl'
        let htmlContent = '';
        if (lessonData.contentData && lessonData.contentData.text) {
            htmlContent += `<p>${lessonData.contentData.text.replace(/\n/g, '<br>')}</p>`;
        }
        if (lessonData.contentData && lessonData.contentData.videoUrl) {
            htmlContent += `<div class="video-placeholder">Video: <a href="${lessonData.contentData.videoUrl}" target="_blank">${lessonData.contentData.videoUrl}</a> (Placeholder for embedded player)</div>`;
        }
        if (!htmlContent) {
            htmlContent = '<p>No content available for this lesson.</p>';
        }
        contentElement.innerHTML = htmlContent;
    }

    if (nextButton) {
        nextButton.dataset.lessonId = lessonData.lessonId;
        if (lessonData.quizId) {
            nextButton.textContent = 'Go to Quiz';
            nextButton.dataset.quizId = lessonData.quizId;
            nextButton.dataset.action = 'go_to_quiz';
        } else {
            // In a real app, you'd know the ID of the actual next lesson
            nextButton.textContent = 'Mark Complete & Next Lesson';
            nextButton.dataset.action = 'complete_lesson_no_quiz';
        }
    }
    if (prevButton) {
        // Logic for previous lesson ID needed
        prevButton.dataset.lessonId = lessonData.lessonId; // current lesson for context
        // prevButton.disabled = !lessonData.previousLessonId;
    }
}

function renderQuizView(quizData, titleTargetId = 'quiz-title', questionsTargetId = 'quiz-questions-container', progressTargetId = 'quiz-progress-indicator') {
    const titleElement = document.getElementById(titleTargetId);
    const questionsElement = document.getElementById(questionsTargetId);
    const progressIndicator = document.getElementById(progressTargetId);
    const submitQuizBtn = document.getElementById('submit-quiz-btn');


    if (titleElement) titleElement.textContent = quizData.title || 'Quiz'; // Assuming quizData has a title
    if (submitQuizBtn) submitQuizBtn.dataset.quizId = quizData.quizId;

    // For MVP, assuming quizData is an array of question objects
    // Example question object: { questionId: "q1", text: "What is ...?", options: [{id: "opt1", text: "A"}, {id: "opt2", text: "B"}] }
    if (questionsElement && quizData.questions && quizData.questions.length > 0) {
        if (progressIndicator) progressIndicator.textContent = `Question 1 of ${quizData.questions.length}`; // Basic, assumes one-by-one display

        // Simplified: render all questions at once for MVP.
        // A real quiz might show one question at a time.
        questionsElement.innerHTML = quizData.questions.map((q, index) => `
            <div class="question" id="question-${q.questionId}">
                <p><strong>${index + 1}. ${q.text}</strong></p>
                ${q.options.map(opt => `
                    <div>
                        <input type="radio" name="question_${q.questionId}" id="option_${q.questionId}_${opt.id}" value="${opt.id}">
                        <label for="option_${q.questionId}_${opt.id}">${opt.text}</label>
                    </div>
                `).join('')}
            </div>
        `).join('');
    } else if (questionsElement) {
        questionsElement.innerHTML = '<p>No questions available for this quiz.</p>';
        if (progressIndicator) progressIndicator.textContent = '';
    }
}

function renderQuizResults(resultsData, scoreTargetId = 'quiz-score', feedbackTargetId = 'quiz-feedback-message', nextActionBtnId = 'quiz-results-next-action-btn') {
    const scoreElement = document.getElementById(scoreTargetId);
    const feedbackElement = document.getElementById(feedbackTargetId);
    const nextButton = document.getElementById(nextActionBtnId);

    if (scoreElement) scoreElement.textContent = `Your Score: ${resultsData.score !== undefined ? resultsData.score.toFixed(1) + '%' : 'N/A'}`;

    let feedbackMessage = resultsData.message || ''; // General message from adaptive engine
    // Could add more detailed feedback based on resultsData.feedback array if available
    if (resultsData.feedback && resultsData.feedback.length > 0) {
        feedbackMessage += "<br/>Detailed Feedback (placeholder):<ul>";
        resultsData.feedback.forEach(fb => {
            feedbackMessage += `<li>Question ${fb.questionId}: ${fb.correct ? 'Correct' : 'Incorrect'}. ${fb.explanation || ''}</li>`;
        });
        feedbackMessage += "</ul>";
    }


    if (feedbackElement) feedbackElement.innerHTML = feedbackMessage; // Use innerHTML if feedback includes HTML

    if (nextButton && resultsData.nextStep) {
        nextButton.dataset.nextAction = resultsData.nextStep.type;
        nextButton.dataset.lessonId = resultsData.nextStep.lessonId; // If applicable
        nextButton.textContent = resultsData.nextStep.message.substring(0,20); // Shorten for button

        if (resultsData.nextStep.type === 'REVIEW_LESSON_MATERIAL') {
            nextButton.textContent = 'Review Lesson';
        } else if (resultsData.nextStep.type.startsWith('PROCEED_NEXT_LESSON')) {
            nextButton.textContent = 'Next Lesson';
        } else {
            nextButton.textContent = 'Continue';
        }
    } else if (nextButton) {
        nextButton.classList.add('hidden'); // Hide if no clear next step
    }
}


function renderMyProgress(progressData, inProgressTargetId = 'my-progress-inprogress-list', completedTargetId = 'my-progress-completed-list') {
    const inProgressList = document.getElementById(inProgressTargetId);
    const completedList = document.getElementById(completedTargetId);

    if (inProgressList) {
        if (progressData.inProgress && progressData.inProgress.length > 0) {
            renderUserCourses(progressData.inProgress, inProgressTargetId, 'in-progress');
        } else {
            inProgressList.innerHTML = '<p>No courses currently in progress.</p>';
        }
    }

    if (completedList) {
        if (progressData.completed && progressData.completed.length > 0) {
            renderUserCourses(progressData.completed, completedTargetId, 'completed');
        } else {
            completedList.innerHTML = '<p>No courses completed yet.</p>';
        }
    }
}

// Add more render functions as needed for other views (e.g., onboarding options)

console.log('ui_render.js loaded');
