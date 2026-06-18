import logging
from pathlib import Path
from typing import Tuple

import numpy as np
import keras
from keras.layers import Layer
from sklearn.preprocessing import StandardScaler

from .config import Config

logger = logging.getLogger(__name__)

# Workaround for Keras 3 deserialization bug where 'quantization_config' is
# included in the saved model but not accepted by layers during loading.
_orig_layer_init = Layer.__init__
def _patched_layer_init(self, *args, **kwargs):
    kwargs.pop("quantization_config", None)
    _orig_layer_init(self, *args, **kwargs)
Layer.__init__ = _patched_layer_init


class LSTMService:
    """Encapsulates loading artifacts, preprocessing, and prediction."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self.model = None
        self.scaler = None
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Load model and scaler statistics into memory at startup."""
        artifacts_dir = Path(self.config.artifacts_dir)
        model_path = artifacts_dir / self.config.model_filename
        means_path = artifacts_dir / self.config.means_filename
        scales_path = artifacts_dir / self.config.scales_filename

        missing_paths = [str(p) for p in [model_path, means_path, scales_path] if not p.exists()]
        if missing_paths:
            raise FileNotFoundError(
                "Missing one or more required artifact files: " + ", ".join(missing_paths)
            )

        logger.info("Loading model from %s", model_path)
        self.model = keras.models.load_model(model_path)

        means = np.load(means_path)
        scales = np.load(scales_path)

        if means.shape[0] != self.config.n_features or scales.shape[0] != self.config.n_features:
            raise ValueError(
                "Scaler statistics do not match N_FEATURES. "
                f"Expected {self.config.n_features}, got means={means.shape[0]}, scales={scales.shape[0]}"
            )

        # Reconstruct a StandardScaler with learned training statistics.
        scaler = StandardScaler()
        scaler.mean_ = means.astype(np.float64)
        scaler.scale_ = scales.astype(np.float64)
        scaler.var_ = np.square(scaler.scale_)
        scaler.n_features_in_ = self.config.n_features
        scaler.n_samples_seen_ = 1
        self.scaler = scaler

        logger.info(
            "Artifacts loaded successfully (window=%d, n_features=%d, threshold=%.4f)",
            self.config.window_size,
            self.config.n_features,
            self.config.threshold,
        )

    def preprocess_sequence(self, sequence) -> np.ndarray:
        """
        Validate and scale input sequence.

        Expected input shape: (window_size, n_features).
        Returned shape: (1, window_size, n_features).
        """
        try:
            arr = np.asarray(sequence, dtype=np.float32)
        except Exception as exc:
            raise ValueError(f"Sequence must be numeric. Error: {exc}") from exc

        expected_shape = (self.config.window_size, self.config.n_features)
        if arr.shape != expected_shape:
            raise ValueError(
                f"Invalid sequence shape. Expected {expected_shape}, got {arr.shape}. "
                "Provide exactly 30 timesteps with 3 features each."
            )

        # Apply same normalization used during training.
        arr_2d = arr.reshape(-1, self.config.n_features)
        scaled_2d = self.scaler.transform(arr_2d)
        scaled_3d = scaled_2d.reshape(1, self.config.window_size, self.config.n_features)
        return scaled_3d.astype(np.float32)

    def predict(self, sequence) -> Tuple[float, int]:
        """Run model inference and apply classification threshold."""
        model_input = self.preprocess_sequence(sequence)
        probability = float(self.model.predict(model_input, verbose=0).ravel()[0])
        prediction = int(probability >= self.config.threshold)
        return probability, prediction

