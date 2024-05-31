from transformers import pipeline, AutoModelForSequenceClassification, AlbertTokenizer
from mindee import Client, PredictResponse, product
from peft import PeftModel
import re
import torch
import pandas as pd
import os
import spacy
from google.cloud import vision


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


def image_categorize(path, flag):
    """OCR"""

    input_doc = mindee_client.source_from_path(path)
    result: PredictResponse = mindee_client.parse(product.InvoiceV4, input_doc)

    x = result.document

    class Document:
        def __init__(self, content):
            self.content = content

        def __str__(self):
            return str(self.content)

    doc = Document(x)
    doc_str = str(doc)

    item_pattern = r"\| (.+?) +\| +\d+\.\d+ +\|"

    l = []
    items = re.findall(item_pattern, doc_str)
    for item in items:
        s = item.replace("|", "").strip()
        if s != "" and s not in l:
            l.append(item.replace("|", "").strip())

    if len(l) == 0:
        print("Google text")
        # Load SpaCy's English language model
        nlp = spacy.load("en_core_web_sm")

        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
            "backend\\phonic-app-422916-i7-90153fe2c451.json"
        )

        """Detects and prints nouns along with their respective adjectives from text annotations."""
        client = vision.ImageAnnotatorClient()

        with open(path, "rb") as image_file:
            content = image_file.read()

        image = vision.Image(content=content)

        response = client.text_detection(image=image)
        texts = response.text_annotations
        s = ""
        for text in texts:
            # Use SpaCy to perform part-of-speech tagging
            doc = nlp(text.description)
            s = s + str(doc)
            # Iterate through tokens to find nouns with their respective adjectives
        s = s[:500]
        return text_categorize(s)

        if response.error.message:
            raise Exception(
                "{}\nFor more info on error messages, check: "
                "https://cloud.google.com/apis/design/errors".format(
                    response.error.message
                )
            )

    c = []
    for items in l:
        c.append(classifier("product " + items)[0]["label"])
    data = pd.DataFrame({"items": l, "category": c})
    return {"items": l, "class": c}, data
