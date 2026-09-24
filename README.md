# ✈️ Airline Customer Satisfaction Predictor
### A Machine Learning Project using Random Forest

---

## 📁 Project Structure

```
airline/
├── app.py                   # Flask web application
├── train_model.py           # Model training script
├── requirements.txt         # Python dependencies
│
├── dataset/
│   └── Airline_customer_satisfaction.csv
│
├── model/
│   ├── random_forest.pkl    # Trained Random Forest model
│   ├── encoders.pkl         # Label encoders for categorical columns
│   ├── target_encoder.pkl   # Target label encoder
│   ├── feature_cols.pkl     # List of feature column names
│   └── metrics.json         # Evaluation metrics
│
├── templates/
│   └── index.html           # Main UI template
│
└── static/
    ├── css/style.css
    ├── js/app.js
    ├── confusion_matrix.png
    └── feature_importance.png
```

---

## 🗃️ Dataset Overview

| Property | Value |
|---|---|
| File | `Airline_customer_satisfaction.csv` |
| Records | 129,880 rows |
| Features | 21 input features |
| Target | `satisfaction` (satisfied / dissatisfied) |
| Missing Values | 393 (`Arrival Delay in Minutes`) |
| Duplicates | 0 |

### Features Used
- **Categorical**: Customer Type, Type of Travel, Class
- **Numerical**: Age, Flight Distance, all service ratings (0–5), Departure/Arrival Delay

---

## 🤖 Model Details

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Estimators | 200 trees |
| Max Depth | 20 |
| Train/Test Split | 80% / 20% |
| Class Weight | Balanced |

---

## 📊 Model Performance

| Metric | Score |
|---|---|
| **Accuracy** | **95.43%** |
| **Precision** | **95.48%** |
| **Recall** | **95.43%** |
| **F1-Score** | **95.44%** |

---

## ⚙️ Setup & Installation

### 1. Install Dependencies

Using Anaconda Python:
```bash
C:\ProgramData\Anaconda3\python.exe -m pip install -r requirements.txt
```

Or standard Python:
```bash
pip install -r requirements.txt
```

### 2. Train the Model

```bash
C:\ProgramData\Anaconda3\python.exe train_model.py
```

This will:
- Load and analyze the dataset
- Preprocess data (handle missing values, encode categories)
- Train Random Forest with 200 estimators
- Evaluate and print metrics
- Save model to `model/` folder
- Save charts to `static/` folder

### 3. Start the Web Application

```bash
C:\ProgramData\Anaconda3\python.exe app.py
```

### 4. Open in Browser

Visit: **http://127.0.0.1:5000**

---

## 🌐 Web UI Features

- **Hero Header** with project title and description
- **Animated Metric Cards** showing Accuracy, Precision, Recall, F1-Score
- **Confusion Matrix** and **Feature Importance** charts
- **Interactive Prediction Form** with:
  - Dropdown menus for categorical fields
  - Number inputs for Age, Flight Distance, Delays
  - Star-style rating buttons (0–5) for all service fields
- **Prediction Result Panel** with confidence score and probability bars

---

## 🔬 Preprocessing Steps

1. Auto-detect CSV dataset from `dataset/` folder
2. Fill missing `Arrival Delay in Minutes` with column median
3. Label-encode categorical columns (Customer Type, Type of Travel, Class)
4. Label-encode target (`satisfied`=1, `dissatisfied`=0)
5. Stratified 80/20 train-test split

---

## 📚 Libraries Used

- `pandas` — data loading and manipulation
- `numpy` — numerical computations
- `scikit-learn` — Random Forest, preprocessing, metrics
- `joblib` — model serialization
- `matplotlib` + `seaborn` — visualization
- `flask` — web application framework
