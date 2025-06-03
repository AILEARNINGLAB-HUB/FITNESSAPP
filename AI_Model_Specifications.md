# AI-Powered Adaptive Training Coach: AI Model Specifications (MVP)

This document details the AI models and mechanisms for the Minimum Viable Product (MVP) of the AI-Powered Adaptive Training Coach. The focus is on delivering core personalization and adaptation with simpler, robust models, allowing for iterative improvements post-MVP.

## 1. Personalization Engine (MVP)

The Personalization Engine for MVP will focus on recommending relevant courses and learning modules to users based on their stated goals and the content of the available training materials.

*   **Model Type:** Content-Based Filtering using TF-IDF and Cosine Similarity.
*   **Rationale:** This approach is relatively straightforward to implement for an MVP, computationally efficient for a moderate number of courses, and provides explainable recommendations. It doesn't suffer from the cold-start problem for new users as it relies on item and user profile features.

*   **Input Data:**
    1.  **User Profile Data:**
        *   `UserID`: Unique identifier for the user.
        *   `LearningGoals`: A list of strings or skill IDs representing what the user wants to learn (e.g., ["Python programming", "Data analysis basics", "Public speaking fundamentals"]).
        *   `CurrentKnowledge`: (Optional for MVP, can be added later) A list of strings or skill IDs representing skills the user already possesses.
    2.  **Course/Module Content Data:**
        *   `CourseID` / `ModuleID`: Unique identifier for the course or module.
        *   `Title`: The title of the course/module.
        *   `Description`: A detailed description of the course/module content.
        *   `SkillTags`: A list of skills covered in the course/module (e.g., ["Python", "Variables", "Loops", "Pandas"]).
        *   `LearningObjectives`: A list of strings stating what the learner will achieve.

*   **Preprocessing:**
    1.  Concatenate relevant text fields for each course/module (Title, Description, SkillTags, LearningObjectives) into a single document.
    2.  Clean the text: lowercase, remove punctuation, remove stop words.
    3.  Lemmatization or stemming can be applied to normalize words.
    4.  User `LearningGoals` will also be processed similarly if they are free-form text. If they are predefined skill IDs, they can be directly matched with `SkillTags`.

*   **Algorithm:**
    1.  **TF-IDF Vectorization:**
        *   Compute TF-IDF (Term Frequency-Inverse Document Frequency) vectors for all courses/modules based on their concatenated text documents. This creates a numerical representation of each course/module in a high-dimensional space, where dimensions correspond to terms and values represent the importance of those terms.
    2.  **User Profile Vectorization:**
        *   For a given user, create a "query" vector representing their `LearningGoals`. This can be done by:
            *   If goals are free-text: Concatenate the user's learning goals text and compute its TF-IDF vector using the same vocabulary learned from the course corpus.
            *   If goals are skill IDs/tags: Create a binary vector where dimensions correspond to the skill tags, or a weighted vector if skill importance can be defined. For TF-IDF similarity, it's often better to map these tags to the textual terms used in course descriptions if possible.
    3.  **Cosine Similarity:**
        *   Calculate the cosine similarity between the user's profile vector and the TF-IDF vector of every course/module. Cosine similarity measures the cosine of the angle between two vectors, indicating how similar they are in direction (i.e., content).
        *   `Similarity(User, Course) = (UserVector ⋅ CourseVector) / (||UserVector|| * ||CourseVector||)`
    4.  **Recommendation:**
        *   Rank courses/modules based on their cosine similarity scores in descending order.
        *   Recommend the top N courses/modules to the user.
        *   (Optional MVP refinement) Filter out courses the user has already completed.

*   **Output:**
    *   A ranked list of `CourseID`s or `ModuleID`s that are most relevant to the user's learning goals.
    *   Example: `[{"course_id": "crs005", "similarity_score": 0.85}, {"course_id": "crs012", "similarity_score": 0.78}, ...]`

*   **Training/Updating:**
    *   The TF-IDF model (vocabulary and IDF weights) is "trained" or built once on the entire corpus of course/module descriptions.
    *   It needs to be updated whenever new courses are added or existing course descriptions change significantly.

## 2. Adaptive Content Delivery Engine (MVP)

The Adaptive Content Delivery Engine for MVP will use a rule-based system to guide users to appropriate next steps based on their performance in quizzes and lesson completion.

*   **Mechanism Type:** Rule-Based System.
*   **Rationale:** Simple to implement and debug for MVP. Provides clear, predictable behavior. Can be expanded with more complex rules or replaced by more advanced models later.

*   **Input Data (Triggers):**
    1.  `UserID`: Unique identifier for the user.
    2.  `LessonID`: Identifier for the lesson just completed.
    3.  `QuizAttemptData` (if the lesson ended with a quiz):
        *   `QuizID`: Identifier for the quiz taken.
        *   `Score`: Percentage score (0-100).
        *   `PassThreshold`: The predefined passing score for this quiz.
        *   `SpecificQuestionPerformance`: (Optional for MVP, can be used for more granular rules later) Data on which questions were answered correctly/incorrectly.
    4.  `LessonCompletionStatus`: Boolean indicating if the lesson content (excluding quiz) was marked as completed by the user.
    5.  `CurrentLearningPath`: The sequence of modules/lessons the user is currently following.

*   **Rules & Triggers:**

    *   **Rule 1: Successful Quiz Performance & Lesson Completion**
        *   **Trigger:** `LessonCompletionStatus` is true AND `QuizAttemptData.Score` >= `QuizAttemptData.PassThreshold`.
        *   **Action:**
            *   Mark the current lesson as "mastered" or "completed successfully."
            *   Advance the user to the next lesson in their `CurrentLearningPath`.
            *   If the current lesson was the last in a module, advance to the first lesson of the next module.
            *   If it was the last lesson of the course, mark the course as "completed."

    *   **Rule 2: Failed Quiz Performance (Below Pass Threshold)**
        *   **Trigger:** `LessonCompletionStatus` is true AND `QuizAttemptData.Score` < `QuizAttemptData.PassThreshold`.
        *   **Action:**
            *   Mark the current lesson as "needs review."
            *   **Option A (Simpler MVP):** Suggest the user re-take the quiz or review the current lesson's material.
            *   **Option B (Slightly more advanced MVP):** If supplementary/remedial content is tagged for this lesson (e.g., an easier explanation, prerequisite concepts), recommend that content to the user. If no such content exists, default to Option A.
            *   The user remains on the current lesson or is directed to the suggested remedial content. They do not automatically advance.

    *   **Rule 3: Lesson Content Completed (No Quiz, or Quiz is Optional and Skipped)**
        *   **Trigger:** `LessonCompletionStatus` is true AND the lesson has no mandatory quiz OR the user chooses to skip an optional quiz.
        *   **Action:**
            *   Mark the lesson as "completed."
            *   Advance the user to the next lesson in their `CurrentLearningPath` (similar to Rule 1).

    *   **Rule 4: (Post-MVP Consideration) Repeated Failures on a Quiz/Lesson**
        *   **Trigger:** User fails the same quiz N times (e.g., 3 times).
        *   **Action:**
            *   Flag for potential intervention (e.g., notify a human trainer if in a corporate setting).
            *   Suggest a foundational module or a different prerequisite skill.

*   **Output:**
    *   A decision on the user's next step:
        *   Next `LessonID` to proceed to.
        *   Suggestion to review current `LessonID`.
        *   Recommendation for a remedial `LessonID` or `ModuleID`.
    *   Updated status for the current lesson (e.g., "mastered," "needs review").

## 3. Other AI Services (MVP Status)

*   **A. Assessment & Feedback Engine:**
    *   **MVP Status:** Very Limited / Post-MVP.
    *   **MVP Functionality:** For quizzes, primarily multiple-choice, true/false, or single-choice questions. Scoring will be automated based on predefined correct answers. Feedback will be generic (e.g., "Correct," "Incorrect - the correct answer was X").
    *   **Post-MVP:** NLP for analyzing open-ended responses, providing more detailed, targeted feedback, and identifying specific areas of misunderstanding.

*   **B. NLP Service (General):**
    *   **MVP Status:** Post-MVP for advanced features.
    *   **MVP Functionality:** Basic text processing (tokenization, stop-word removal) will be part of the Personalization Engine's TF-IDF preprocessing. No sophisticated NLP features like chatbots or deep semantic understanding will be in MVP.
    *   **Post-MVP:** Powering chatbots for user support, advanced analysis of user queries, and deeper understanding of training content.

*   **C. Analytics & Reporting Service:**
    *   **MVP Status:** Post-MVP for AI-driven predictive analytics.
    *   **MVP Functionality:** Basic tracking of user progress (lessons completed, quiz scores, courses finished) will be stored and can be displayed on a simple dashboard. No AI-driven trend prediction or at-risk learner identification in MVP.
    *   **Post-MVP:** Predictive analytics for user success, identifying at-risk learners, forecasting skill acquisition.

*   **D. Content Generation Support Service:**
    *   **MVP Status:** Post-MVP.
    *   **MVP Functionality:** Not included. All content is assumed to be manually created.

The MVP AI models are designed to provide core value quickly while laying the groundwork for more sophisticated AI capabilities in future iterations.Now, I'll create `API_Specifications.md`.
