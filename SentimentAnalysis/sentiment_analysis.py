from transformers import pipeline

# load the sentiment-analysis pipeline once
sentiment_pipeline = pipeline("sentiment-analysis")

def sentiment_analyzer(text):
    result = sentiment_pipeline(text)[0]  # returns list with one dict
    return {
        "label": result["label"],   # "POSITIVE" or "NEGATIVE"
        "score": round(result["score"] * 100, 2) # confidence score
    }
