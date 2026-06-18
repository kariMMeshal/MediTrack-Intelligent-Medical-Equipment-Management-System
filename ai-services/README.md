# Medical Equipment Failure Prediction API

This project provides a REST API for predicting medical equipment failures and assessing device risk using machine learning models (LSTM for time-series and Random Forest for risk classification).

## Features

- **LSTM Failure Predictor**: Analyzes 30-step time-series sequences of sensor data to predict binary failure outcomes.
- **RF Risk Classifier**: Categorizes devices into Low, Medium, or High risk classes based on technical specifications and maintenance history.
- **Flask API**: Lightweight and easy-to-deploy RESTful service.
- **Docker Support**: Containerized environment for consistent deployment.

## Quick Start (Docker)

The easiest way to run the application is using Docker:
1st Ensure you have Docker installed.
then run :
```bash
docker-compose up --build
```
and Test the health endpoint at : http://localhost:5000/health.

then The API will be available at `http://localhost:5000`.

## Manual Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python run.py
   ```

## API Endpoints

### 1. Health Check
`GET /health`
- **Description**: Verifies the service and models are running.
- **Response**: `{"status": "ok"}`

### 2. LSTM Prediction
`POST /api/predict/lstm`
- **Body**:
  ```json
  {
    "sequence": [[0.5, 0.2, 0.1], ..., [0.6, 0.3, 0.2]]
  }
  ```
  *(Requires exactly 30 timesteps with 3 features each)*
- **Response**:
  ```json
  {
    "probability": 0.85,
    "prediction": 1
  }
  ```

### 3. Random Forest Risk Assessment
`POST /api/predict/rf`
- **Body**:
  ```json
  {
    "features": {
        "Device_Type": "Ventilator",
        "Age": 5,
        "MTBF": 1200,
        "Maintenance_Class": "Medium"
    }
  }
  ```
- **Response**:
  ```json
  {
    "confidence_score": 0.92,
    "predicted_class": 1,
    "predicted_label": "Medium Risk"
  }
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
