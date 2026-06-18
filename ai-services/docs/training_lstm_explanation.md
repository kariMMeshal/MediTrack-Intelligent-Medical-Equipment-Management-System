# `training_lstm.ipynb` Full Explanation and Outputs

This file explains everything done in `training_lstm.ipynb`, including:
- the full training pipeline,
- why each step exists,
- execution/tuning changes made,
- and the final outputs.

---

## 1) Goal of the notebook

Train an LSTM model to predict:
- `Will_Fail_In_72_Hours` (binary target: 0/1)

using only leakage-safe time-series sensor features:
- `Simulated_Temperature_Variance`
- `Simulated_Motor_Vibration_Hz`
- `Simulated_Voltage_Drop`

---

## 2) What the notebook does (cell-by-cell logic)

### A. Imports, seeds, reproducibility

- Imports `numpy`, `pandas`, `sklearn`, and `tensorflow/keras`.
- Sets fixed random seed (`SEED = 42`) for reproducible splits and training.

### B. Load dataset

- Reads `processed_timeseries_level.csv`.
- Prints shape and columns for verification.

Observed output in run:
- Raw shape: `(1514385, 10)`
- Columns:
  - `Device_ID`
  - `Device_Type`
  - `Timestamp`
  - `Simulated_Temperature_Variance`
  - `Simulated_Motor_Vibration_Hz`
  - `Simulated_Voltage_Drop`
  - `RUL_Hours`
  - `RUL_Days`
  - `RUL`
  - `Will_Fail_In_72_Hours`

### C. Leakage-safe feature selection

- Keeps only:
  - `Device_ID`
  - `Timestamp`
  - 3 simulated sensor features
  - target `Will_Fail_In_72_Hours`
- Converts `Timestamp` to datetime.
- Sorts by `Device_ID`, `Timestamp`.

Why:
- Prevents leakage from `RUL_Hours`, `RUL_Days`, and `RUL`, which directly encode failure horizon.

Observed output:
- Model shape: `(1514385, 6)`
- Target distribution:
  - `0`: `0.978613`
  - `1`: `0.021387`

### D. Device-aware split

- Splits by unique `Device_ID` into:
  - 70% train devices
  - 15% validation devices
  - 15% test devices
- This ensures no same-device leakage across sets.

Observed output:
- Train devices: `2904`, rows: `1059960`
- Val devices: `622`, rows: `227030`
- Test devices: `623`, rows: `227395`
- Positive ratio:
  - train: `0.0215`
  - val: `0.0208`
  - test: `0.0215`

### E. Scaling + sequence window generation

- Fits `StandardScaler` on **train only**.
- Applies scaler to val/test using train statistics.
- Builds sliding windows of length `30` per device.
- Label for each window = target at window end.

Final tuned execution used:
- `WINDOW = 30`
- `STRIDE = 3` (speed optimization)

Observed output:
- `X_train`: `(325248, 30, 3)`, `y_train`: `(325248,)`
- `X_val`: `(69664, 30, 3)`, `y_val`: `(69664,)`
- `X_test`: `(69776, 30, 3)`, `y_test`: `(69776,)`
- Train positives: `0.017890964`

### F. Class imbalance handling

- Computes class weights from `y_train`:
  - higher weight for minority class (`1`)
- Uses `tf.data` pipelines with batching/prefetching.

Observed output:
- `class_weight = {0: 0.5091084403732911, 1: 27.947069943289225}`

### G. LSTM model architecture

- Sequential model:
  - `LSTM(64, return_sequences=True)`
  - `Dropout(0.2)`
  - `LSTM(32)`
  - `Dropout(0.2)`
  - `Dense(16, relu)`
  - `Dense(1, sigmoid)`
- Compiled with:
  - Adam optimizer
  - Binary cross-entropy
  - Metrics: ROC-AUC, PR-AUC, precision, recall

### H. Training callbacks

- `EarlyStopping` on `val_auc_pr`
- `ReduceLROnPlateau` on `val_auc_pr`

Final tuned execution used:
- epochs: `8`
- early stopping patience: `3`
- LR scheduler patience: `1`
- batch size: `512`

### I. Threshold tuning and evaluation

- Predicts probabilities on validation and test.
- Finds best decision threshold from validation F1 over PR-curve thresholds.
- Reports:
  - PR-AUC
  - ROC-AUC
  - classification report
  - confusion matrix

### J. Artifact saving

Saved files:
- `artifacts/lstm_failure_predictor.keras`
- `artifacts/feature_means.npy`
- `artifacts/feature_scales.npy`
- `artifacts/training_meta.json`

---

## 3) Final output metrics from successful run

### Best threshold

- Best threshold from validation F1: `0.9897`

### Validation set

- PR-AUC: `0.9982996127147484`
- ROC-AUC: `0.999970276390748`

Classification:
- Class `0`:
  - precision: `0.9996`
  - recall: `0.9998`
  - f1-score: `0.9997`
  - support: `68479`
- Class `1`:
  - precision: `0.9897`
  - recall: `0.9755`
  - f1-score: `0.9826`
  - support: `1185`

Overall:
- accuracy: `0.9994`
- macro avg f1: `0.9911`
- weighted avg f1: `0.9994`

Confusion matrix:
- `[[68467, 12], [29, 1156]]`

### Test set

- PR-AUC: `0.9981553167844596`
- ROC-AUC: `0.9999666957086454`

Classification:
- Class `0`:
  - precision: `0.9995`
  - recall: `0.9997`
  - f1-score: `0.9996`
  - support: `68554`
- Class `1`:
  - precision: `0.9850`
  - recall: `0.9705`
  - f1-score: `0.9777`
  - support: `1222`

Overall:
- accuracy: `0.9992`
- macro avg f1: `0.9887`
- weighted avg f1: `0.9992`

Confusion matrix:
- `[[68536, 18], [36, 1186]]`

---

## 4) Runtime/engineering notes

- TensorFlow was not installed initially; installed successfully.
- One earlier long run was stopped due to high runtime.
- A tuned faster run was then used and completed successfully.
- Environment warning observed:
  - `streamlit` expects older `protobuf`, while TensorFlow install upgraded `protobuf`.
  - Training still completed correctly.

---

## 5) Summary

The notebook now implements a leakage-safe, device-aware, class-imbalance-aware LSTM pipeline and produced very strong validation/test performance on the synthetic dataset. Artifacts are saved and ready for reuse/inference.
