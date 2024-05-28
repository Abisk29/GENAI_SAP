from transformers import pipeline, AutoModelForSequenceClassification, AlbertTokenizer
from mindee import Client, PredictResponse, product
from peft import PeftModel
import re
import torch
import pandas as pd

"""Importing model"""
tokenizer = AlbertTokenizer.from_pretrained("backend\\albert")
model = AutoModelForSequenceClassification.from_pretrained("backend\\merged")
mindee_client = Client(api_key="c93e4bc18ecb603d02bbcced7e51cabc")

classifier = pipeline(
    "text-classification",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1,
)


def text_categorize(text):
    result = classifier(text)
    items = [text]
    category = [result[0]["label"]]
    data = pd.DataFrame({"items": items, "category": category})
    return {"items": items, "class": category}, data


def image_categorize(path):
    """OCR"""

    input_doc = mindee_client.source_from_path(path)
    result: PredictResponse = mindee_client.parse(product.ReceiptV5, input_doc)
    x = result.document

    class Document:
        def __init__(self, content):
            self.content = content

        def __str__(self):
            return str(self.content)

    doc = Document(x)
    doc_str = str(doc)

    """text extraction"""
    item_pattern = r"\| (.+?) +\| (\d+\.\d+) +\| (\d+\.\d+) +\|"

    items = re.findall(item_pattern, doc_str)
    l = []

    for item in items:
        description, quantity, total_amount = item
        l.append(description)
    s = set(l)
    l = list(s)

    unique_items = []

    seen_descriptions = set()

    for item in items:
        description, quantity, total_amount = item

        if description not in seen_descriptions:
            unique_items.append((description, quantity, total_amount))
            seen_descriptions.add(description)

    unique_items_list = list(unique_items)

    for item in unique_items_list:
        print(f"Description: {item[0]}, Quantity: {item[1]}, Total Amount: {item[2]}")

    items = []
    classification = []

    for i in unique_items_list:
        classification.append(classifier(str(i))[0]["label"])

    for k in l:
        items.append(k)

    if len(items) == len(classification):
        result = pd.DataFrame({"items": items, "category": classification})
        return {"items": items, "class": classification}, result
    else:
        print("Error: Lists have different lengths.")
    return
