from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import os

MODEL_NAME = "openai/clip-vit-base-patch32"

FOODS = [
    "banana",
    "apple",
    "orange",
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
]

print("Loading CLIP model...")

model = CLIPModel.from_pretrained(MODEL_NAME)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)

print("Model loaded.\n")

test_root = "test_images"

top1_correct = 0
top3_correct = 0
total = 0

for actual_food in FOODS:

    folder_name = actual_food.replace(" ", "_")
    test_folder = os.path.join(test_root, folder_name)

    print(f"\nTesting: {actual_food}")

    for filename in os.listdir(test_folder):

        image_path = os.path.join(test_folder, filename)

        if not filename.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp")
        ):
            continue

        image = Image.open(image_path).convert("RGB")

        inputs = processor(
            text=FOODS,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            outputs = model(**inputs)

        probabilities = outputs.logits_per_image.softmax(dim=1)[0]

        top3_indices = torch.topk(
            probabilities,
            k=3
        ).indices.tolist()

        top3_predictions = [
            FOODS[index]
            for index in top3_indices
        ]

        top1_prediction = top3_predictions[0]
        top1_confidence = probabilities[top3_indices[0]].item()

        total += 1

        if top1_prediction == actual_food:
            top1_correct += 1

        if actual_food in top3_predictions:
            top3_correct += 1

        print(
            f"{filename} -> "
            f"Top-1: {top1_prediction} "
            f"({top1_confidence:.4f})"
        )

        print(
            f"   Top-3: {', '.join(top3_predictions)}"
        )

top1_accuracy = (top1_correct / total) * 100
top3_accuracy = (top3_correct / total) * 100

print("\n=========================")
print(f"Total Images: {total}")
print(f"Top-1 Correct: {top1_correct}/{total}")
print(f"Top-1 Accuracy: {top1_accuracy:.2f}%")
print()
print(f"Top-3 Correct: {top3_correct}/{total}")
print(f"Top-3 Accuracy: {top3_accuracy:.2f}%")
print("=========================")