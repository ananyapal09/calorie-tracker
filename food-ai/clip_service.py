from flask import Flask, request, jsonify
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

app = Flask(__name__)

print("Loading CLIP model...")

model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32"
)

processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32"
)

food_labels = [
    "banana",
    "mango",
    "apple",
    "rice",
    "egg",
    "bread",
    "roti",
    "chicken",
    "milk",
    "oats",
    "potato",
    "orange",
    "yogurt",
    "dal",
    "paneer",
    "pizza",
    "burger",
    "salad",
    "pasta",
    "french fries",
    "peanut butter",
]

# Minimum confidence required to accept a prediction
CONFIDENCE_THRESHOLD = 0.25

print("CLIP model loaded successfully.")


@app.route("/predict", methods=["POST"])
def predict():

    try:

        if "image" not in request.files:
            return jsonify({
                "error": "Image is required"
            }), 400

        image_file = request.files["image"]

        image = Image.open(
            image_file
        ).convert("RGB")

        inputs = processor(
            text=food_labels,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            outputs = model(**inputs)

        probabilities = (
            outputs.logits_per_image
            .softmax(dim=1)[0]
        )

        results = sorted(
            zip(
                food_labels,
                probabilities.tolist()
            ),
            key=lambda x: x[1],
            reverse=True
        )

        food, confidence = results[0]

        # ----------------------------------
        # CONFIDENCE CHECK
        # ----------------------------------

        if confidence < CONFIDENCE_THRESHOLD:

            return jsonify({
                "food": None,

                "confidence": round(
                    confidence,
                    4
                ),

                "topPredictions": [
                    {
                        "food": label,
                        "confidence": round(
                            score,
                            4
                        )
                    }

                    for label, score
                    in results[:5]
                ],

                "error":
                    "Food could not be identified confidently. Please upload a clearer food image."
            })

        # ----------------------------------
        # CONFIDENT PREDICTION
        # ----------------------------------

        return jsonify({

            "food": food,

            "confidence": round(
                confidence,
                4
            ),

            "topPredictions": [
                {
                    "food": label,
                    "confidence": round(
                        score,
                        4
                    )
                }

                for label, score
                in results[:5]
            ]
        })

    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        return jsonify({
            "error":
                "Failed to process food image"
        }), 500


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False
    )