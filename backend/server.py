import io
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import model
import pandas as pd

app = Flask(__name__)
CORS(app)
df = pd.DataFrame()


@app.route("/check", methods=["GET"])
def check():
    return jsonify("Server is running!")


@app.route("/text", methods=["POST"])
def text_categorize():
    global df
    data = request.json
    text = data.get("text")
    result, df1 = model.text_categorize(text)
    df = pd.concat([df, df1], ignore_index=True)
    print(result)
    return jsonify(result)


@app.route("/image", methods=["POST"])
def image_categorize():
    global df
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        flag = request.form.get("flag", default=0, type=int)
        # Save the file to a temporary location
        temp_path = os.path.join("/tmp", file.filename)
        file.save(temp_path)
        result, df1 = model.image_categorize(temp_path, flag)
        df = pd.concat([df, df1], ignore_index=True)
        print(result)
        os.remove(temp_path)
        return jsonify(result)


@app.route("/download-csv", methods=["GET"])
def download_csv():
    global df
    # Convert DataFrame to CSV in memory
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    # Send the CSV file as a response
    return send_file(
        io.BytesIO(csv_buffer.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="data.csv",
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Ensure Flask runs on port 5000
