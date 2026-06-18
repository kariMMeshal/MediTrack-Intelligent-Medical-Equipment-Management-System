# Random Forest General Risk Classifier: Training & Processing Report

This document explains the step-by-step pipeline used to train the Random Forest model in the `train_general_risk_classifier.ipynb` notebook.

---

## 1. Goal of the Model (Business Value)
The **General Risk Classifier** acts as a long-term performance review for medical equipment. It looks at the lifetime historical and financial statistics of a medical device (e.g., Age, Total Downtime, Mean Time Between Failures, and Maintenance Cost Per Hour) and categorizes the equipment into a broad risk tier:
*   **0**: Low Risk
*   **1**: Medium Risk
*   **2**: High Risk

Unlike the LSTM (which acts like a technician monitoring live sensor data for immediate failure), the Random Forest helps hospital administrators decide which machines are becoming a financial or operational liability over time.

---

## 2. Data Processing Pipeline

### A. Data Loading
The model loads the tabular lifetime data from `processed_device_level.csv`.
*   **Total Dataset Shape:** `(4149 rows, 20 columns)`
*   **Target Distribution:**
    *   Low Risk (0): `14.17%`
    *   Medium Risk (1): `74.28%`
    *   High Risk (2): `11.54%`

### B. Feature Selection & Dropping Leakage
To ensure the model learns generalized patterns rather than memorizing exact IDs, the following columns were dropped:
*   `Device_ID` (unique identifier)
*   `Risk_Class` (string version of the target label)
*   `Maintenance_Report` (unstructured text)
*   `Purchase_Date` (replaced by the `Age` feature)

**Final Features used:**
`Device_Type`, `Age`, `Manufacturer`, `Model`, `Country`, `Maintenance_Cost`, `Downtime`, `Maintenance_Frequency`, `Failure_Event_Count`, `Maintenance_Class`, `Operational_Hours_Est`, `Expected_Lifespan_Est`, `MTBF`, `Cost_Per_Hour`, `Lifespan_Usage_Ratio`

### C. Preprocessing (Imputation & Encoding)
We used a scikit-learn `ColumnTransformer` to handle different types of data automatically:
1.  **Numerical Features** (e.g., `Age`, `Downtime`, `Cost_Per_Hour`): Processed using a `SimpleImputer` to fill any missing values with the median.
2.  **Categorical Features** (e.g., `Device_Type`, `Manufacturer`, `Country`): Processed using a `SimpleImputer` (most frequent) followed by `OneHotEncoder` to convert text categories into numerical binary flags.

### D. Train/Test Split
The data was split into an **80% Training Set** and a **20% Test Set** (using `stratify=y` to maintain the exact same ratio of Low/Medium/High risk devices in both sets).
*   **Prepared Training Shape:** `(3319 rows, 41 encoded features)`

---

## 3. Model Training
We trained a **Random Forest Classifier** with the following parameters:
*   `n_estimators=300`: Built an ensemble of 300 decision trees to ensure robust predictions.
*   `class_weight="balanced"`: Handled the class imbalance (since Medium Risk makes up ~74% of the data) by adjusting the penalty for misclassifying minority classes (Low and High Risk).
*   `random_state=42`: Set a fixed seed to ensure reproducibility.

---

## 4. Testing & Output Metrics

The model performed exceptionally well on the unseen test set (830 devices), easily separating the risk tiers based on lifetime statistics.

### Overall Accuracy: **99.88%**

### Classification Report:
| Class | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **0 (Low Risk)** | 1.00 | 1.00 | 1.00 | 118 |
| **1 (Medium Risk)** | 1.00 | 1.00 | 1.00 | 616 |
| **2 (High Risk)** | 1.00 | 0.99 | 0.99 | 96 |

**Confusion Matrix Interpretation:**
Out of 830 devices, the model correctly categorized almost every single device. Only a negligible fraction of high-risk devices were misclassified.

---

## 5. Explainability (Feature Importance)
One of the biggest advantages of using a Random Forest is that it is highly explainable. Instead of acting as a "black box", the notebook extracts the `feature_importances_` to explicitly rank the reasons why devices are flagged.

For example, if an administrator asks *why* an MRI Scanner was flagged as "High Risk", the model's feature importance chart proves that it prioritizes financial and operational liabilities. The top influential features historically included:
1.  `Cost_Per_Hour`
2.  `MTBF` (Mean Time Between Failures)
3.  `Maintenance_Cost`
4.  `Downtime`
5.  `Age`

---

## 6. Saving Artifacts
Finally, the notebook saved both the fully trained model and the preprocessing pipeline so that they can be used later in your Flask backend (`ml_api/run.py`) to grade new incoming devices:
1.  `artifacts/rf_risk_preprocessor.joblib`
2.  `artifacts/rf_risk_classifier.joblib`
