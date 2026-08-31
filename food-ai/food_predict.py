import sys
import json

from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch


MODEL_NAME = "openai/clip-vit-base-patch32"

FOODS = [
    "banana",
    "mango",
    "apple",
    "rice",
    "dal",
    "paneer",
    "roti",
    "chicken",
    "egg",
    "bread",
    "toast",
    "milk",
    "oats",
    "potato",
    "peanut butter",
    "yogurt",
    "pizza",
    "burger",
    "salad",
    "pasta",
    "french fries",
]


# Load CLIP model
model = CLIPModel.from_pretrained(MODEL_NAME)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)


# Image path comes from Node.js
image_path = sys.argv[1]

image = Image.open(image_path).convert("RGB")


# Prepare input
inputs = processor(
    text=FOODS,
    images=image,
    return_tensors="pt",
    padding=True
)


# Run prediction
with torch.no_grad():
    outputs = model(**inputs)


probabilities = outputs.logits_per_image.softmax(dim=1)[0]


# Get top 5 predictions
top_indices = torch.topk(
    probabilities,
    k=5
).indices


best_index = top_indices[0]

best_food = FOODS[best_index]
best_confidence = float(probabilities[best_index])


# Minimum confidence required
CONFIDENCE_THRESHOLD = 0.60


# If confidence is too low, reject prediction
if best_confidence < CONFIDENCE_THRESHOLD:

    print(json.dumps({
        "predictions": [],
        "error": (
            "Food could not be identified confidently. "
            "Please upload a clearer food image."
        )
    }))

    sys.exit(0)


# Build top predictions
predictions = []

for index in top_indices:

    predictions.append({
        "food": FOODS[index],
        "confidence": round(
            float(probabilities[index]),
            4
        )
    })


# Return JSON to Node.js
print(json.dumps({
    "predictions": predictions
}))