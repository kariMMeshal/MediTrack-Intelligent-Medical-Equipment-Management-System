import logging

from flask import Flask, jsonify

from .config import Config
from .lstm_service import LSTMService
from .rf_service import RFRiskService
from .routes import api_bp


def create_app(config: Config | None = None) -> Flask:
    """Flask application factory."""
    app = Flask(__name__)
    app.config["APP_CONFIG"] = config or Config()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    # Load model artifacts once during startup and keep service as app state.
    app.lstm_service = LSTMService(app.config["APP_CONFIG"])
    app.rf_service = RFRiskService(app.config["APP_CONFIG"])
    app.register_blueprint(api_bp)

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    return app

