import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import model

app = Flask(__name__)
CORS(app)


@app.route("/check", methods=["GET"])
def check():
    return "Server is running!"


@app.route("/text", methods=["POST"])
def text_categorize():
    data = request.json
    text = data.get("text")
    result = model.text_categorize(text)
    print(result)
    return jsonify(result)


@app.route("/image", methods=["POST"])
def image_categorize():
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Save the file to a temporary location
        temp_path = os.path.join("/tmp", file.filename)
        file.save(temp_path)
        result = model.image_categorize(temp_path)
        print(result)
        os.remove(temp_path)
        return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Ensure Flask runs on port 5000
