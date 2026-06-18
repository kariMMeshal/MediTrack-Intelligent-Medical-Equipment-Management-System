import argparse
import json
import os

import numpy as np
import pandas as pd
import tensorflow as tf


def load_artifacts(artifacts_dir: str):
    model_path = os.path.join(artifacts_dir, "lstm_failure_predictor.keras")
    meta_path = os.path.join(artifacts_dir, "training_meta.json")
    means_path = os.path.join(artifacts_dir, "feature_means.npy")
    scales_path = os.path.join(artifacts_dir, "feature_scales.npy")

    missing = [p for p in [model_path, meta_path, means_path, scales_path] if not os.path.exists(p)]
    if missing:
        raise FileNotFoundError(
            "Missing required artifact files:\n"
            + "\n".join(missing)
            + "\n\nRun your training notebook first to generate all files in artifacts/."
        )

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    model = tf.keras.models.load_model(model_path)
    means = np.load(means_path)
    scales = np.load(scales_path)

    return model, meta, means, scales


def make_last_window_per_device(df: pd.DataFrame, feature_cols, window: int):
    rows = []
    windows = []

    for device_id, grp in df.groupby("Device_ID", sort=False):
        grp = grp.sort_values("Timestamp")
        if len(grp) < window:
            continue
        x = grp[feature_cols].to_numpy(dtype=np.float32)[-window:]
        windows.append(x)
        rows.append(
            {
                "Device_ID": device_id,
                "Last_Timestamp": grp["Timestamp"].iloc[-1],
                "Rows_Used": int(len(grp)),
            }
        )

    if not windows:
        return pd.DataFrame(), np.empty((0, window, len(feature_cols)), dtype=np.float32)

    return pd.DataFrame(rows), np.array(windows, dtype=np.float32)


def main():
    parser = argparse.ArgumentParser(
        description="Predict failure in 72 hours from time-series CSV using trained LSTM artifacts."
    )
    parser.add_argument("--input", required=True, help="Path to input CSV with time-series data.")
    parser.add_argument("--artifacts", default="artifacts", help="Path to artifacts directory.")
    parser.add_argument("--output", default="predictions.csv", help="Output CSV path for predictions.")
    args = parser.parse_args()

    model, meta, means, scales = load_artifacts(args.artifacts)
    feature_cols = meta["feature_cols"]
    window = int(meta["window"])
    threshold = float(meta["threshold"])

    df = pd.read_csv(args.input)
    required_cols = {"Device_ID", "Timestamp", *feature_cols}
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in input CSV: {missing_cols}")

    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    df = df.sort_values(["Device_ID", "Timestamp"]).reset_index(drop=True)

    # Apply training-time standardization
    scaled = df[feature_cols].to_numpy(dtype=np.float32)
    df.loc[:, feature_cols] = (scaled - means) / scales

    info_df, X = make_last_window_per_device(df, feature_cols, window)
    if X.shape[0] == 0:
        raise ValueError(
            f"No devices had at least {window} rows. "
            "Provide more history per device in your input data."
        )

    probs = model.predict(X, batch_size=1024, verbose=0).ravel()
    preds = (probs >= threshold).astype(int)

    out = info_df.copy()
    out["Failure_Probability_72h"] = probs
    out["Predicted_Fail_In_72_Hours"] = preds
    out["Decision_Threshold"] = threshold

    out.to_csv(args.output, index=False)

    print(f"Predictions saved: {args.output}")
    print("Preview:")
    print(out.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
