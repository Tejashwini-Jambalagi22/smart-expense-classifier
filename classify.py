def classify_expense(text: str):
    """
    Dummy classifier. 
    Replace with ML model if needed.
    """
    text = text.lower()

    if "food" in text:
        return "Food"
    elif "travel" in text:
        return "Travel"
    elif "bill" in text:
        return "Bills"
    elif "shopping" in text:
        return "Shopping"
    else:
        return "Other"

