import nbformat as nbf
import os

nb = nbf.v4.new_notebook()

md_intro = """# General Risk Classifier (Random Forest)

## Business Value
Hospitals need to know which machines are becoming a financial or operational liability over time. 
This Random Forest model acts as the hospital administrator doing a long-term performance review of the equipment. 
It analyzes the lifetime historical and financial statistics of a medical device (e.g., Age, Total Downtime, Mean Time Between Failures (MTBF), and Maintenance Cost Per Hour) and categorizes the equipment into a broad risk tier: Low Risk, Medium Risk, or High Risk.

Because the Random Forest is highly explainable, if it flags an MRI machine as "High Risk," it can generate a feature importance report that explicitly tells the hospital administrator exactly why (e.g., "This machine is classified as High Risk because its Maintenance Cost Per Hour is too high and its MTBF is dropping").
"""

code_imports = """import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay, accuracy_score
"""

code_load = """DATA_PATH = "../data/processed/processed_device_level.csv"
TARGET_COL = "Risk_Class_Label"

df = pd.read_csv(DATA_PATH)
print(f"Shape: {df.shape}")
display(df.head())
"""

code_prep = """# Drop obvious ID-like or duplicate-target columns for modeling.
drop_cols = ["Device_ID", "Risk_Class", "Maintenance_Report", "Purchase_Date"]
drop_cols = [c for c in drop_cols if c in df.columns]

X = df.drop(columns=[TARGET_COL] + drop_cols)
y = df[TARGET_COL]

print("Target distribution:")
print(y.value_counts(normalize=True).sort_index())
print("\\nFeature columns:")
print(X.columns.tolist())
"""

code_pipeline = """numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
categorical_features = X.select_dtypes(exclude=[np.number]).columns.tolist()

numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
])

try:
    ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
except TypeError:
    ohe = OneHotEncoder(handle_unknown="ignore", sparse=False)

categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", ohe),
])

preprocessor = ColumnTransformer(transformers=[
    ("num", numeric_transformer, numeric_features),
    ("cat", categorical_transformer, categorical_features),
])
"""

code_split = """X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

X_train_prepared = preprocessor.fit_transform(X_train)
X_test_prepared = preprocessor.transform(X_test)

print("Prepared train shape:", X_train_prepared.shape)
print("Ready for Random Forest training.")
"""

code_train = """rf_classifier = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1,
)

print("Training Random Forest General Risk Classifier...")
rf_classifier.fit(X_train_prepared, y_train)

y_pred = rf_classifier.predict(X_test_prepared)

print("Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print("\\nClassification report:")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm)

fig, ax = plt.subplots(figsize=(5, 4))
disp.plot(ax=ax, colorbar=False)
ax.set_title("Random Forest - Risk Class Confusion Matrix")
plt.show()
"""

code_explain = """feature_names = preprocessor.get_feature_names_out()
importances = rf_classifier.feature_importances_

importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": importances,
}).sort_values("importance", ascending=False)

print("Top Feature Importances (Why the model flags devices):")
display(importance_df.head(10))

plt.figure(figsize=(10, 6))
plot_df = importance_df.head(10).iloc[::-1]
plt.barh(plot_df["feature"], plot_df["importance"])
plt.title("Top 10 Feature Importances (General Risk Classifier)")
plt.xlabel("Importance")
plt.tight_layout()
plt.show()
"""

code_save = """os.makedirs("../artifacts", exist_ok=True)

# Save the full pipeline or components
joblib.dump(preprocessor, "../artifacts/rf_risk_preprocessor.joblib")
joblib.dump(rf_classifier, "../artifacts/rf_risk_classifier.joblib")

print("Saved ../artifacts/rf_risk_preprocessor.joblib")
print("Saved ../artifacts/rf_risk_classifier.joblib")
print("Model and preprocessor are ready for deployment!")
"""

nb['cells'] = [
    nbf.v4.new_markdown_cell(md_intro),
    nbf.v4.new_code_cell(code_imports),
    nbf.v4.new_code_cell(code_load),
    nbf.v4.new_code_cell(code_prep),
    nbf.v4.new_code_cell(code_pipeline),
    nbf.v4.new_code_cell(code_split),
    nbf.v4.new_code_cell(code_train),
    nbf.v4.new_code_cell(code_explain),
    nbf.v4.new_code_cell(code_save)
]

with open("notebooks/train_general_risk_classifier.ipynb", "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print("Successfully created train_general_risk_classifier.ipynb!")
