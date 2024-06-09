import flask
import base64
import io
import matplotlib.pyplot as plt
import numpy as np
import torch
from model import caption_model
from PIL import Image

app = flask.Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return {"message": "Connection successful"}

@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    # Extract base64 image data from the request body
    image_data = flask.request.form.get("image")  # x-www-form-urlencoded

    print(type(image_data))
    if image_data is not None:
        try:
          
            decoded_image_data = base64.b64decode(image_data)
            img = Image.open(io.BytesIO(decoded_image_data))
            generated_caption, _ = caption_model(img, 2.0)
            return {"caption": generated_caption}

        except Exception as error:
            print(error)
            return 400
    else:
        return "No image data provided", 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
