from ml_api import create_app

app = create_app()


if __name__ == "__main__":
    cfg = app.config["APP_CONFIG"]
    app.run(host="0.0.0.0", port=5000, debug=cfg.debug)
