# AI-Powered Adaptive Training Coach: Data Schema Outline

This document outlines a potential data schema for the core entities of the AI-Powered Adaptive Training Coach. The schema is conceptual and would need refinement for a specific database implementation.

## I. User Data

**1. `Users` Table**
    *   `UserID` (Primary Key, UUID/Auto-increment Int)
    *   `FirstName` (String)
    *   `LastName` (String)
    *   `Email` (String, Unique, Indexed)
    *   `PasswordHash` (String)
    *   `ProfilePictureURL` (String, Optional)
    *   `PreferredLanguage` (String, e.g., 'en', 'es')
    *   `Timezone` (String, e.g., 'America/New_York')
    *   `LearningPacePreference` (Enum: 'slow', 'medium', 'fast', Optional)
    *   `PreferredLearningModalities` (Array/JSON, e.g., ['video', 'interactive', 'text'], Optional)
    *   `RegistrationDate` (Timestamp)
    *   `LastLoginDate` (Timestamp)
    *   `AccountStatus` (Enum: 'active', 'inactive', 'suspended')
    *   `Role` (Enum: 'learner', 'admin', 'trainer', 'manager') - *Could be a separate Roles & Permissions system for more complexity*

**2. `UserProfiles` Table (1-to-1 with Users, or extend Users table)**
    *   `ProfileID` (Primary Key, Foreign Key to `Users.UserID`)
    *   `Bio` (Text, Optional)
    *   `Interests` (Array/JSON, Optional)
    *   `CurrentKnowledge` (JSON, e.g., `{"skill_id_1": "proficient", "skill_id_2": "novice"}`) - *Could link to a Skills table*
    *   `CustomPreferences` (JSON, Optional)

**3. `UserGoals` Table (1-to-Many with Users)**
    *   `GoalID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `GoalDescription` (Text)
    *   `TargetSkillID` (Foreign Key to `Skills.SkillID`, Optional)
    *   `TargetCourseID` (Foreign Key to `Courses.CourseID`, Optional)
    *   `TargetDate` (Date, Optional)
    *   `Status` (Enum: 'active', 'achieved', 'abandoned')
    *   `CreationDate` (Timestamp)

## II. Content Data

**1. `Skills` Table (Master list of skills)**
    *   `SkillID` (Primary Key, UUID/Auto-increment Int)
    *   `SkillName` (String, Unique)
    *   `SkillDescription` (Text, Optional)
    *   `Category` (String, Optional, e.g., 'Programming', 'Soft Skills')
    *   `ParentSkillID` (Foreign Key to `Skills.SkillID`, Self-referential for hierarchy, Optional)

**2. `Courses` Table**
    *   `CourseID` (Primary Key, UUID/Auto-increment Int)
    *   `CourseTitle` (String)
    *   `CourseDescription` (Text)
    *   `PrimarySkillID` (Foreign Key to `Skills.SkillID`, Optional)
    *   `SecondarySkillIDs` (Array/JSON of SkillIDs, Optional)
    *   `AuthorID` (Foreign Key to `Users.UserID` - if trainers can create courses)
    *   `DifficultyLevel` (Enum: 'beginner', 'intermediate', 'advanced')
    *   `EstimatedDurationMinutes` (Integer)
    *   `ThumbnailURL` (String, Optional)
    *   `CreationDate` (Timestamp)
    *   `LastUpdatedDate` (Timestamp)
    *   `IsPublished` (Boolean)

**3. `Modules` Table (Belong to Courses)**
    *   `ModuleID` (Primary Key, UUID/Auto-increment Int)
    *   `CourseID` (Foreign Key to `Courses.CourseID`)
    *   `ModuleTitle` (String)
    *   `ModuleOrder` (Integer, for sequence within a course)
    *   `EstimatedDurationMinutes` (Integer, Optional)

**4. `Lessons` / `ContentUnits` Table (Belong to Modules)**
    *   `LessonID` (Primary Key, UUID/Auto-increment Int)
    *   `ModuleID` (Foreign Key to `Modules.ModuleID`)
    *   `LessonTitle` (String)
    *   `LessonOrder` (Integer, for sequence within a module)
    *   `ContentType` (Enum: 'text', 'video', 'quiz', 'interactive_exercise', 'simulation', 'external_link')
    *   `ContentData` (JSON or Text - stores actual text, video URL, quiz ID, exercise config)
    *   `EstimatedDurationMinutes` (Integer, Optional)
    *   `IsPreviewAllowed` (Boolean, Default: false)

**5. `Quizzes` Table (Reusable across lessons/modules)**
    *   `QuizID` (Primary Key, UUID/Auto-increment Int)
    *   `QuizTitle` (String)
    *   `Description` (Text, Optional)
    *   `PassThreshold` (Float, e.g., 0.75 for 75%)

**6. `Questions` Table (Belong to Quizzes)**
    *   `QuestionID` (Primary Key, UUID/Auto-increment Int)
    *   `QuizID` (Foreign Key to `Quizzes.QuizID`, Optional - could be standalone for question banks)
    *   `QuestionText` (Text)
    *   `QuestionType` (Enum: 'multiple_choice', 'single_choice', 'true_false', 'fill_in_the_blanks', 'open_ended')
    *   `Options` (JSON, e.g., `[{"id": "a", "text": "Option A"}, {"id": "b", "text": "Option B"}]`)
    *   `CorrectAnswer` (JSON, e.g., `["a"]` or `{"blank_1": "answer"}`)
    *   `Explanation` (Text, Optional - for feedback)
    *   `DifficultyLevel` (Enum: 'easy', 'medium', 'hard', Optional)
    *   `SkillTags` (Array/JSON of SkillIDs, Optional)

**7. `MediaAssets` Table (For storing video, image, document info)**
    *   `AssetID` (Primary Key, UUID/Auto-increment Int)
    *   `AssetType` (Enum: 'video', 'image', 'document', 'audio')
    *   `FileName` (String)
    *   `StorageURL` (String, e.g., S3 URL)
    *   `MimeType` (String)
    *   `FileSizeKB` (Integer)
    *   `UploadDate` (Timestamp)
    *   `UploaderUserID` (Foreign Key to `Users.UserID`, Optional)

## III. Interaction & Progress Data

**1. `UserCourseEnrollments` Table**
    *   `EnrollmentID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `CourseID` (Foreign Key to `Courses.CourseID`)
    *   `EnrollmentDate` (Timestamp)
    *   `Status` (Enum: 'in_progress', 'completed', 'dropped')
    *   `CompletionDate` (Timestamp, Optional)
    *   `OverallProgressPercent` (Float, 0-100)
    *   `CertificateID` (Foreign Key to `Certificates.CertificateID`, Optional)

**2. `UserLessonProgress` Table**
    *   `ProgressID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `LessonID` (Foreign Key to `Lessons.LessonID`)
    *   `EnrollmentID` (Foreign Key to `UserCourseEnrollments.EnrollmentID`)
    *   `Status` (Enum: 'not_started', 'started', 'completed')
    *   `LastAccessedDate` (Timestamp)
    *   `TimeSpentSeconds` (Integer, Optional)
    *   `Score` (Float, Optional, if lesson is a quiz)

**3. `UserQuizAttempts` Table**
    *   `AttemptID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `QuizID` (Foreign Key to `Quizzes.QuizID`)
    *   `LessonID` (Foreign Key to `Lessons.LessonID`, Optional, context of the quiz)
    *   `AttemptDate` (Timestamp)
    *   `Score` (Float)
    *   `IsPassed` (Boolean)
    *   `TimeTakenSeconds` (Integer)

**4. `UserQuestionAnswers` Table (Detailed answers for each attempt)**
    *   `AnswerID` (Primary Key, UUID/Auto-increment Int)
    *   `AttemptID` (Foreign Key to `UserQuizAttempts.AttemptID`)
    *   `QuestionID` (Foreign Key to `Questions.QuestionID`)
    *   `UserAnswer` (JSON/Text)
    *   `IsCorrect` (Boolean, Optional for open-ended)
    *   `FeedbackGiven` (Text, Optional)

**5. `UserFeedback` Table (General feedback on content, platform etc.)**
    *   `FeedbackID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `RelatedEntityType` (Enum: 'course', 'lesson', 'platform', 'feature', Optional)
    *   `RelatedEntityID` (UUID/Int, Optional)
    *   `Rating` (Integer, 1-5, Optional)
    *   `Comment` (Text)
    *   `SubmissionDate` (Timestamp)

**6. `UserAchievements` Table (Badges, Points)**
    *   `AchievementID` (Primary Key, UUID/Auto-increment Int)
    *   `UserID` (Foreign Key to `Users.UserID`)
    *   `AchievementType` (Enum: 'badge', 'points_milestone')
    *   `Name` (String, e.g., "Completed First Course", "1000 Points")
    *   `Description` (Text, Optional)
    *   `DateAwarded` (Timestamp)
    *   `IconURL` (String, Optional)

## IV. AI-Specific Data (Conceptual)

*   **`UserSkillProficiency` Table (Derived/Updated by AI)**
    *   `UserID` (Foreign Key)
    *   `SkillID` (Foreign Key)
    *   `ProficiencyScore` (Float, e.g., 0.0 - 1.0)
    *   `LastUpdated` (Timestamp)
    *   `Evidence` (JSON, e.g., links to assessments, activities contributing to this score)

*   **`ContentEmbeddings` Table (For AI-powered search/recommendation)**
    *   `ContentID` (UUID, refers to LessonID, ModuleID, CourseID, QuestionID)
    *   `ContentType` (Enum: 'lesson', 'module', 'course', 'question')
    *   `EmbeddingVector` (Large Array/Blob)
    *   `ModelVersion` (String)
    *   `CreationDate` (Timestamp)

This schema provides a foundational structure. Specific choices (e.g., UUID vs. auto-increment integers, JSON vs. separate tables for some attributes) will depend on the chosen database technology and scalability requirements. Normalization and denormalization trade-offs would also be considered during detailed design.
