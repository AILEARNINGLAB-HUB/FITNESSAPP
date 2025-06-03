from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# Ensure text_processor is importable. If aiml/ is the root for Python's perspective:
# from utils.text_processor import preprocess_text
# If core/ is run directly and utils is a sibling:
import sys
import os
# Add the parent directory (aiml) to sys.path to find the utils package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.text_processor import preprocess_text


class PersonalizationEngineMVP:
    def __init__(self, courses_data: list):
        """
        Initializes the Personalization Engine.
        :param courses_data: A list of course dictionaries.
                              Each dict must have 'id', 'title', and 'description' keys.
                              Example: [{'id': 'c1', 'title': 'Intro to Python', 'description': 'Learn Python basics.'}, ...]
        """
        self.courses_data = courses_data
        self.course_ids = [course['id'] for course in courses_data]

        # Prepare corpus for TF-IDF
        # Concatenate title and description for a richer representation
        self.corpus = []
        for course in courses_data:
            text_to_process = f"{course.get('title', '')} {course.get('description', '')} {' '.join(course.get('skillTags', []))}"
            self.corpus.append(preprocess_text(text_to_process))

        self.vectorizer = TfidfVectorizer()

        if not self.corpus:
            # Handle empty corpus case: fit an empty vectorizer or raise error
            # For now, allowing fit on empty which will result in no features.
            # Recommendations will likely be empty or based on zero vectors.
            self.course_tfidf_matrix = self.vectorizer.fit_transform([])
        else:
            self.course_tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def recommend_courses(self, user_goals_text: str, top_n: int = 5) -> list:
        """
        Recommends courses based on user's learning goals.
        :param user_goals_text: A string describing the user's learning goals.
        :param top_n: The number of top courses to recommend.
        :return: A list of course IDs, ranked by similarity.
        """
        if not user_goals_text or self.course_tfidf_matrix.shape[0] == 0:
            return []

        processed_goals = preprocess_text(user_goals_text)
        if not processed_goals.strip(): # If goals become empty after preprocessing
            return []

        user_goals_vector = self.vectorizer.transform([processed_goals])

        # Calculate cosine similarity
        similarities = cosine_similarity(user_goals_vector, self.course_tfidf_matrix)

        # Get similarity scores for each course
        # similarities is a 2D array (1xN), so we take the first row
        course_similarity_scores = similarities[0]

        # Get sorted course indices based on similarity (descending)
        # [::-1] reverses the array to get descending order
        sorted_course_indices = course_similarity_scores.argsort()[::-1]

        # Get top N course IDs
        recommended_course_ids = []
        for i in range(min(top_n, len(sorted_course_indices))):
            course_index = sorted_course_indices[i]
            # Only recommend if similarity is above a certain threshold (e.g. > 0)
            if course_similarity_scores[course_index] > 0.0: # Basic threshold
                recommended_course_ids.append({
                    "course_id": self.course_ids[course_index],
                    "similarity_score": round(float(course_similarity_scores[course_index]), 4) #Store score
                })

        return recommended_course_ids

if __name__ == '__main__':
    # Example Usage
    sample_courses = [
        {'id': 'course1', 'title': 'Introduction to Python Programming', 'description': 'Learn the fundamentals of Python, including variables, loops, and functions.', 'skillTags': ['python', 'programming', 'beginner']},
        {'id': 'course2', 'title': 'Advanced Python Techniques', 'description': 'Explore advanced topics like decorators, generators, and metaprogramming in Python.', 'skillTags': ['python', 'advanced', 'programming']},
        {'id': 'course3', 'title': 'Data Analysis with Pandas', 'description': 'Master data manipulation and analysis using the Pandas library in Python.', 'skillTags': ['python', 'data analysis', 'pandas', 'intermediate']},
        {'id': 'course4', 'title': 'Web Development with Flask', 'description': 'Build web applications using the Flask microframework for Python.', 'skillTags': ['python', 'web development', 'flask', 'intermediate']},
        {'id': 'course5', 'title': 'Machine Learning Basics', 'description': 'An introduction to core machine learning concepts and algorithms.', 'skillTags': ['machine learning', 'AI', 'concepts', 'beginner']},
        {'id': 'course6', 'title': 'JavaScript Fundamentals', 'description': 'Understand the basics of JavaScript for web development.', 'skillTags': ['javascript', 'web development', 'beginner']}
    ]

    engine = PersonalizationEngineMVP(sample_courses)

    user_goals1 = "I want to learn basic programming with Python."
    recommendations1 = engine.recommend_courses(user_goals1, top_n=3)
    print(f"Recommendations for '{user_goals1}': {recommendations1}")
    # Expected: course1, course2, course4/course3 (depending on TF-IDF nuances)

    user_goals2 = "I am interested in data analysis and machine learning."
    recommendations2 = engine.recommend_courses(user_goals2, top_n=3)
    print(f"Recommendations for '{user_goals2}': {recommendations2}")
    # Expected: course3, course5, course1/course2

    user_goals3 = "I want to build websites."
    recommendations3 = engine.recommend_courses(user_goals3, top_n=3)
    print(f"Recommendations for '{user_goals3}': {recommendations3}")
    # Expected: course4, course6

    user_goals_empty = ""
    recommendations_empty = engine.recommend_courses(user_goals_empty)
    print(f"Recommendations for empty goals: {recommendations_empty}") # Expected: []

    engine_no_courses = PersonalizationEngineMVP([])
    recommendations_no_courses = engine_no_courses.recommend_courses(user_goals1)
    print(f"Recommendations from engine with no courses: {recommendations_no_courses}") # Expected: []

    user_goals_unrelated = "I want to learn to cook Italian food."
    recommendations_unrelated = engine.recommend_courses(user_goals_unrelated)
    print(f"Recommendations for '{user_goals_unrelated}': {recommendations_unrelated}") # Expected: [] or low scores

    user_goals_specific_tag = "Learn Pandas"
    recommendations_specific_tag = engine.recommend_courses(user_goals_specific_tag)
    print(f"Recommendations for '{user_goals_specific_tag}': {recommendations_specific_tag}") # Expected: course3
