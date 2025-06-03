class AdaptiveEngineMVP:
    def __init__(self):
        """
        Initializes the Adaptive Engine.
        For MVP, rules are hardcoded. Post-MVP, rules could be loaded from a configuration file or database.
        """
        # Example pass threshold, could be part of quiz metadata in a real system
        self.default_pass_threshold_low = 0.5  # e.g. 50%
        self.default_pass_threshold_high = 0.8 # e.g. 80%

    def get_next_action(self, user_id: str, lesson_id: str,
                          quiz_score: float = None,
                          lesson_content_completed: bool = False,
                          current_difficulty: str = 'medium') -> dict:
        """
        Determines the next action for a user based on their recent activity.

        :param user_id: Identifier for the user.
        :param lesson_id: Identifier for the current or just completed lesson.
        :param quiz_score: Optional. The user's score on a quiz (e.g., 0.0 to 1.0).
        :param lesson_content_completed: Boolean indicating if the main lesson content was marked as completed.
        :param current_difficulty: Optional. The current difficulty level of the content.
        :return: A dictionary containing the suggested 'action', 'lesson_id' (if applicable), and a 'message'.
        """

        if quiz_score is not None:
            # Quiz was taken
            if quiz_score < self.default_pass_threshold_low:
                return {
                    'action': 'REVIEW_LESSON_MATERIAL',
                    'lesson_id': lesson_id,
                    'message': f'Your score of {quiz_score*100:.0f}% suggests this topic needs more review. Please go over the lesson material for {lesson_id} and try the quiz again.'
                }
            elif self.default_pass_threshold_low <= quiz_score < self.default_pass_threshold_high:
                return {
                    'action': 'PROCEED_NEXT_LESSON_SAME_DIFFICULTY',
                    'current_lesson_id': lesson_id,
                    'message': f'Good job on the quiz for lesson {lesson_id} (score: {quiz_score*100:.0f}%)! You are ready for the next lesson at the current difficulty.'
                    # In a real system, it would also provide the 'next_lesson_id'.
                }
            else: # quiz_score >= self.default_pass_threshold_high
                return {
                    'action': 'PROCEED_NEXT_LESSON_POSSIBLY_INCREASE_DIFFICULTY',
                    'current_lesson_id': lesson_id,
                    'message': f'Excellent work on the quiz for lesson {lesson_id} (score: {quiz_score*100:.0f}%)! You have mastered this topic. Consider increasing difficulty for future topics if available.'
                    # In a real system, it would also provide the 'next_lesson_id'.
                }
        elif lesson_content_completed:
            # Lesson content was completed, and there was no quiz (or quiz was optional and skipped)
            return {
                'action': 'PROCEED_NEXT_LESSON_SAME_DIFFICULTY',
                'current_lesson_id': lesson_id,
                'message': f'Lesson {lesson_id} content completed. Please proceed to the next lesson.'
                # In a real system, it would also provide the 'next_lesson_id'.
            }
        else:
            # Lesson content not yet marked as completed, no quiz score submitted
            return {
                'action': 'CONTINUE_CURRENT_LESSON',
                'lesson_id': lesson_id,
                'message': f'Please continue working on lesson {lesson_id}.'
            }

if __name__ == '__main__':
    engine = AdaptiveEngineMVP()

    user_id_example = "user123"
    lesson_id_example = "lesson_py_basics_01"

    # Scenario 1: User failed a quiz
    action1 = engine.get_next_action(user_id_example, lesson_id_example, quiz_score=0.4, lesson_content_completed=True)
    print(f"Scenario 1 (Quiz Fail): {action1}")

    # Scenario 2: User passed a quiz with a decent score
    action2 = engine.get_next_action(user_id_example, lesson_id_example, quiz_score=0.7, lesson_content_completed=True)
    print(f"Scenario 2 (Quiz Pass - Good): {action2}")

    # Scenario 3: User aced a quiz
    action3 = engine.get_next_action(user_id_example, lesson_id_example, quiz_score=0.95, lesson_content_completed=True)
    print(f"Scenario 3 (Quiz Pass - Excellent): {action3}")

    # Scenario 4: User completed lesson content (no quiz)
    action4 = engine.get_next_action(user_id_example, lesson_id_example, lesson_content_completed=True)
    print(f"Scenario 4 (Lesson Content Completed, No Quiz): {action4}")

    # Scenario 5: User is still working on lesson content
    action5 = engine.get_next_action(user_id_example, lesson_id_example, lesson_content_completed=False)
    print(f"Scenario 5 (Lesson Content In Progress): {action5}")

    # Scenario 6: User just started a lesson, no quiz score yet, content not fully completed.
    action6 = engine.get_next_action(user_id_example, lesson_id_example)
    print(f"Scenario 6 (Initial state for a lesson): {action6}")
