import logging
import pandas as pd
import joblib
from pathlib import Path
from typing import Tuple, Dict, Any

from .config import Config

logger = logging.getLogger(__name__)


class RFRiskService:
    """
    Encapsulates loading artifacts, preprocessing,
    and prediction for the RF Risk Classifier.
    """

    def __init__(self, config: Config) -> None:
        self.config = config
        self.preprocessor = None
        self.model = None
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Load model and preprocessor into memory at startup."""

        artifacts_dir = Path(self.config.artifacts_dir)

        prep_path = artifacts_dir / self.config.rf_preprocessor_filename
        model_path = artifacts_dir / self.config.rf_model_filename

        missing_paths = [
            str(p)
            for p in [prep_path, model_path]
            if not p.exists()
        ]

        if missing_paths:
            raise FileNotFoundError(
                "Missing one or more required artifact files: "
                + ", ".join(missing_paths)
            )

        logger.info("Loading RF preprocessor from %s", prep_path)
        self.preprocessor = joblib.load(prep_path)

        logger.info("Loading RF model from %s", model_path)
        self.model = joblib.load(model_path)

        logger.info("RF artifacts loaded successfully")


    def predict(self, features: Dict[str, Any]) -> Tuple[float, int, str]:
        """
        Run RF model inference.

        Returns:
            (confidence_score, predicted_class, predicted_label)
        """

        # ----------------------------------------
        # Convert categorical API inputs if needed
        # ----------------------------------------
        try:
            maintenance_map = {
                "Low": 0,
                "Medium": 1,
                "High": 2
            }

            if "Maintenance_Class" in features:
                value = features["Maintenance_Class"]

                # Accept string labels
                if isinstance(value, str):
                    value = value.strip()

                    if value not in maintenance_map:
                        raise ValueError(
                            "Maintenance_Class must be "
                            "Low, Medium, or High"
                        )

                    features["Maintenance_Class"] = maintenance_map[value]

                # Accept already-encoded numeric values
                elif isinstance(value, (int, float)):
                    if value not in [0, 1, 2]:
                        raise ValueError(
                            "Numeric Maintenance_Class must be 0,1,2"
                        )

                else:
                    raise ValueError(
                        "Invalid type for Maintenance_Class"
                    )

        except Exception as exc:
            raise ValueError(
                f"Invalid Maintenance_Class value. Error: {exc}"
            ) from exc


        # ----------------------------------------
        # Convert incoming dict to dataframe
        # ----------------------------------------
        try:
            df = pd.DataFrame([features])

        except Exception as exc:
            raise ValueError(
                f"Features must be a dictionary. Error: {exc}"
            ) from exc


        # ----------------------------------------
        # Drop unused columns if passed
        # ----------------------------------------
        drop_cols = [
            "Device_ID",
            "Risk_Class",
            "Maintenance_Report",
            "Purchase_Date",
            "Risk_Class_Label"
        ]

        cols_to_drop = [
            c for c in drop_cols
            if c in df.columns
        ]

        if cols_to_drop:
            df = df.drop(columns=cols_to_drop)


        # ----------------------------------------
        # Preprocess
        # ----------------------------------------
        try:
            X_processed = self.preprocessor.transform(df)

        except Exception as exc:
            raise ValueError(
                "Failed to preprocess features. "
                "Check if required fields are missing. "
                f"Error: {exc}"
            ) from exc


        # ----------------------------------------
        # Predict
        # ----------------------------------------
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)

        pred_class = int(predictions[0])
        confidence = float(probabilities[0].max())

        risk_mapping = {
            0: "Low Risk",
            1: "Medium Risk",
            2: "High Risk"
        }

        pred_label = risk_mapping.get(
            pred_class,
            "Unknown"
        )

        return confidence, pred_class, pred_label