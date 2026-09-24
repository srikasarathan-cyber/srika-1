# ============================================================
#  app.py  –  Flask Web App for Airline Satisfaction Predictor
# ============================================================

import os
import json
import numpy as np
import joblib
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ------------------------------------------------------------------
# Load saved model artefacts
# ------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

rf          = joblib.load(os.path.join(MODEL_DIR, "random_forest.pkl"))
encoders    = joblib.load(os.path.join(MODEL_DIR, "encoders.pkl"))
target_le   = joblib.load(os.path.join(MODEL_DIR, "target_encoder.pkl"))
feature_cols = joblib.load(os.path.join(MODEL_DIR, "feature_cols.pkl"))

with open(os.path.join(MODEL_DIR, "metrics.json")) as f:
    metrics = json.load(f)

# Pre-build options for categorical dropdowns
CAT_OPTIONS = {col: list(enc.classes_) for col, enc in encoders.items()}

# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@app.route("/")
def index():
    return render_template(
        "index.html",
        feature_cols=feature_cols,
        cat_options=CAT_OPTIONS,
        metrics=metrics
    )


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        input_values = []

        for col in feature_cols:
            val = data.get(col)
            if val is None:
                return jsonify({"error": f"Missing field: {col}"}), 400

            # Encode categorical columns
            if col in encoders:
                val = encoders[col].transform([val])[0]
            else:
                val = float(val)

            input_values.append(val)

        X_input = np.array(input_values).reshape(1, -1)
        pred_encoded = rf.predict(X_input)[0]
        pred_proba   = rf.predict_proba(X_input)[0]
        pred_label   = target_le.inverse_transform([pred_encoded])[0]

        # Probability for the predicted class
        pred_confidence = round(float(max(pred_proba)) * 100, 2)

        # Probabilities per class
        class_probs = {
            cls: round(float(prob) * 100, 2)
            for cls, prob in zip(target_le.classes_, pred_proba)
        }

        return jsonify({
            "prediction": pred_label,
            "confidence": pred_confidence,
            "class_probabilities": class_probs
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
