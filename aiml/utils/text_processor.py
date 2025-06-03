import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Ensure NLTK data is available.
# In a real application, this might be handled during setup or a build process.
try:
    stopwords.words('english')
except LookupError:
    nltk.download('stopwords', quiet=True)
try:
    # The 'punkt' tokenizer is needed for word_tokenize, which PorterStemmer might use implicitly
    # or if you decide to tokenize before stemming.
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)


def preprocess_text(text: str, use_stemming: bool = True) -> str:
    """
    Cleans and preprocesses text.
    - Lowercasing
    - Removing punctuation
    - Removing stopwords
    - Optionally, stemming
    """
    if not isinstance(text, str):
        return ""

    # 1. Lowercasing
    text = text.lower()

    # 2. Removing punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # 3. Tokenization (implicitly handled by TF-IDF, but good for stopwords and stemming)
    words = text.split() # Simple split; for more accuracy, nltk.word_tokenize could be used

    # 4. Removing stopwords
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]

    # 5. Optionally, stemming
    if use_stemming:
        stemmer = PorterStemmer()
        words = [stemmer.stem(word) for word in words]

    return " ".join(words)

if __name__ == '__main__':
    sample_text_with_issues = "This is a Sample Text with Punctuation!! And UPPERCASE words, for testing purposes. Running quickly."
    print(f"Original: {sample_text_with_issues}")
    processed_text = preprocess_text(sample_text_with_issues)
    print(f"Processed (with stemming): {processed_text}")
    processed_text_no_stem = preprocess_text(sample_text_with_issues, use_stemming=False)
    print(f"Processed (no stemming): {processed_text_no_stem}")

    sample_text_2 = "Learning Python programming is fun and rewarding."
    print(f"Original: {sample_text_2}")
    processed_text_2 = preprocess_text(sample_text_2)
    print(f"Processed (with stemming): {processed_text_2}")

    empty_text = ""
    print(f"Original: '{empty_text}'")
    processed_empty_text = preprocess_text(empty_text)
    print(f"Processed (with stemming): '{processed_empty_text}'")

    none_text = None
    # print(f"Original: '{none_text}'") # This would cause an error if not handled in preprocess_text
    processed_none_text = preprocess_text(none_text)
    print(f"Processed (with stemming, input was None): '{processed_none_text}'")
