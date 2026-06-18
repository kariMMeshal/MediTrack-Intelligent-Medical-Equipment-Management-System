import logging

from flask import Blueprint, current_app, jsonify, request

logger = logging.getLogger(__name__)

api_bp = Blueprint("api", __name__)


@api_bp.get("/health")
def health():
    """Health endpoint for readiness/liveness checks."""
    return jsonify({"status": "ok"}), 200


@api_bp.post("/predict/lstm")
def predict_lstm():
    """
    Predict binary failure outcome from a single time-series sequence.

    Body format:
    {
      "sequence": [[f1, f2, f3], ..., 30 rows total]
    }
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON."}), 400

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON payload."}), 400

    if "sequence" not in payload:
        return jsonify({"error": "Missing required field: sequence"}), 400

    try:
        probability, prediction = current_app.lstm_service.predict(payload["sequence"])
    except ValueError as exc:
        logger.warning("Validation error in /predict: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Unexpected inference error: %s", exc)
        return jsonify({"error": "Internal server error during prediction."}), 500

    return (
        jsonify(
            {
                "probability": probability,
                "prediction": prediction,
            }
        ),
        200,
    )


@api_bp.post("/predict/rf")
def predict_rf():
    """
    Predict risk class from tabular device features.

    Body format:
    {
      "features": {
          "Device_Type": "...",
          "Age": 5,
          "MTBF": 1200,
          ...
      }
    }
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON."}), 400

    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON payload."}), 400

    if "features" not in payload:
        return jsonify({"error": "Missing required field: features"}), 400

    try:
        confidence, pred_class, pred_label = current_app.rf_service.predict(payload["features"])
    except ValueError as exc:
        logger.warning("Validation error in /predict/rf: %s", exc)
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Unexpected inference error: %s", exc)
        return jsonify({"error": "Internal server error during prediction."}), 500

    return (
        jsonify(
            {
                "confidence_score": confidence,
                "predicted_class": pred_class,
                "predicted_label": pred_label,
            }
        ),
        200,
    )

