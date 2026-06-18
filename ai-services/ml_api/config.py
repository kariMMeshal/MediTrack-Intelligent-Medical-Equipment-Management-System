import os
from dataclasses import dataclass


@dataclass
class Config:
    """Application configuration loaded from environment variables."""

    artifacts_dir: str = os.getenv("ARTIFACTS_DIR", "artifacts")
    model_filename: str = os.getenv("MODEL_FILENAME", "lstm_failure_predictor.keras")
    means_filename: str = os.getenv("MEANS_FILENAME", "feature_means.npy")
    scales_filename: str = os.getenv("SCALES_FILENAME", "feature_scales.npy")
    rf_preprocessor_filename: str = os.getenv("RF_PREP_FILENAME", "rf_risk_preprocessor.joblib")
    rf_model_filename: str = os.getenv("RF_MODEL_FILENAME", "rf_risk_classifier.joblib")
    window_size: int = int(os.getenv("WINDOW_SIZE", "30"))
    n_features: int = int(os.getenv("N_FEATURES", "3"))
    threshold: float = float(os.getenv("PREDICTION_THRESHOLD", "0.9897"))
    debug: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"

