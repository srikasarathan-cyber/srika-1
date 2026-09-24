# ============================================================
#  train_model.py  –  Airline Customer Satisfaction Predictor
#  Random Forest Classifier
# ============================================================

import os
import glob
import json
import warnings
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)

warnings.filterwarnings("ignore")

# ------------------------------------------------------------------
# 1.  Auto-detect dataset
# ------------------------------------------------------------------
DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")
csv_files = glob.glob(os.path.join(DATASET_DIR, "*.csv"))
if not csv_files:
    raise FileNotFoundError("No CSV file found in the dataset/ folder.")

DATASET_PATH = csv_files[0]
print(f"[INFO] Loading dataset: {DATASET_PATH}")
df = pd.read_csv(DATASET_PATH)
print(f"[INFO] Shape: {df.shape}")

# ------------------------------------------------------------------
# 2.  Dataset Analysis
# ------------------------------------------------------------------
TARGET_COL = "satisfaction"
DROP_COLS  = []          # no ID column in this dataset

print("\n=== Dataset Analysis ===")
print(f"Target column   : {TARGET_COL}")
print(f"Total rows      : {df.shape[0]}")
print(f"Total columns   : {df.shape[1]}")
print(f"Missing values  :\n{df.isnull().sum()[df.isnull().sum() > 0]}")
print(f"Duplicates      : {df.duplicated().sum()}")
print(f"Class distribution:\n{df[TARGET_COL].value_counts()}")

# ------------------------------------------------------------------
# 3.  Preprocessing
# ------------------------------------------------------------------
# 3a. Drop unnecessary columns
if DROP_COLS:
    df.drop(columns=DROP_COLS, inplace=True, errors="ignore")

# 3b. Handle missing values
#     'Arrival Delay in Minutes' has 393 NaN – fill with median
for col in df.columns:
    if df[col].isnull().sum() > 0:
        if df[col].dtype in [np.float64, np.int64]:
            df[col].fillna(df[col].median(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)

# 3c. Encode categorical columns
CATEGORICAL_COLS = df.select_dtypes(include=["object"]).columns.tolist()
CATEGORICAL_COLS = [c for c in CATEGORICAL_COLS if c != TARGET_COL]

encoders = {}   # store encoders to reuse in Flask app
for col in CATEGORICAL_COLS:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# Encode target
target_le = LabelEncoder()
df[TARGET_COL] = target_le.fit_transform(df[TARGET_COL])
# satisfied=1, dissatisfied=0
print(f"\nTarget encoding: {dict(zip(target_le.classes_, target_le.transform(target_le.classes_)))}")

# 3d. Feature / target split
FEATURE_COLS = [c for c in df.columns if c != TARGET_COL]
X = df[FEATURE_COLS]
y = df[TARGET_COL]

print(f"\nFeatures ({len(FEATURE_COLS)}): {FEATURE_COLS}")

# 3e. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\nTrain size : {X_train.shape[0]}")
print(f"Test  size : {X_test.shape[0]}")

# ------------------------------------------------------------------
# 4.  Train Random Forest
# ------------------------------------------------------------------
print("\n[INFO] Training Random Forest Classifier ...")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    n_jobs=-1,
    random_state=42,
    class_weight="balanced"
)
rf.fit(X_train, y_train)
print("[INFO] Training complete.")

# ------------------------------------------------------------------
# 5.  Evaluation
# ------------------------------------------------------------------
y_pred = rf.predict(X_test)

acc  = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average="weighted")
rec  = recall_score(y_test, y_pred, average="weighted")
f1   = f1_score(y_test, y_pred, average="weighted")
cm   = confusion_matrix(y_test, y_pred)
cr   = classification_report(y_test, y_pred, target_names=target_le.classes_)

print("\n=== Model Evaluation ===")
print(f"Accuracy  : {acc:.4f}")
print(f"Precision : {prec:.4f}")
print(f"Recall    : {rec:.4f}")
print(f"F1-Score  : {f1:.4f}")
print(f"\nConfusion Matrix:\n{cm}")
print(f"\nClassification Report:\n{cr}")

# ------------------------------------------------------------------
# 6.  Save artefacts
# ------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(rf, os.path.join(MODEL_DIR, "random_forest.pkl"))
joblib.dump(encoders, os.path.join(MODEL_DIR, "encoders.pkl"))
joblib.dump(target_le, os.path.join(MODEL_DIR, "target_encoder.pkl"))
joblib.dump(FEATURE_COLS, os.path.join(MODEL_DIR, "feature_cols.pkl"))

metrics = {
    "accuracy":  round(acc  * 100, 2),
    "precision": round(prec * 100, 2),
    "recall":    round(rec  * 100, 2),
    "f1_score":  round(f1   * 100, 2),
    "train_size": int(X_train.shape[0]),
    "test_size":  int(X_test.shape[0]),
    "n_features": len(FEATURE_COLS),
    "target_classes": list(target_le.classes_),
    "confusion_matrix": cm.tolist()
}
with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

print(f"\n[INFO] Model saved -> {MODEL_DIR}/random_forest.pkl")
print(f"[INFO] Metrics saved -> {MODEL_DIR}/metrics.json")

# ------------------------------------------------------------------
# 7.  Plot Confusion Matrix & Feature Importance
# ------------------------------------------------------------------
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

# Confusion matrix heatmap
fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=target_le.classes_,
            yticklabels=target_le.classes_, ax=ax)
ax.set_xlabel("Predicted", fontsize=12)
ax.set_ylabel("Actual", fontsize=12)
ax.set_title("Confusion Matrix", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(STATIC_DIR, "confusion_matrix.png"), dpi=120)
plt.close()

# Feature importance chart (top 15)
importances = pd.Series(rf.feature_importances_, index=FEATURE_COLS)
top15 = importances.nlargest(15)

fig, ax = plt.subplots(figsize=(8, 5))
colors = plt.cm.Blues(np.linspace(0.4, 0.9, len(top15)))[::-1]
top15.sort_values().plot(kind="barh", ax=ax, color=colors)
ax.set_title("Top 15 Feature Importances", fontsize=14, fontweight="bold")
ax.set_xlabel("Importance Score")
plt.tight_layout()
plt.savefig(os.path.join(STATIC_DIR, "feature_importance.png"), dpi=120)
plt.close()

print("[INFO] Charts saved to static/")
print("\n[DONE] Run 'python app.py' to start the web app.")
