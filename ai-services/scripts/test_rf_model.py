import pandas as pd
import joblib
import os

def create_example_data(input_path="data/examples/example_risk_input.csv"):
    # Create 3 example devices (Low, Medium, and High Risk profiles)
    data = [
        {
            "Device_ID": "MD-TEST-001",
            "Device_Type": "Infusion Pump",
            "Purchase_Date": "2024-01-10",
            "Age": 1,
            "Manufacturer": "MedEquip",
            "Model": "Model-650",
            "Country": "France",
            "Maintenance_Cost": 500.00,
            "Downtime": 1.5,
            "Maintenance_Frequency": 1,
            "Failure_Event_Count": 0,
            "Maintenance_Class": 1,
            "Operational_Hours_Est": 8760,
            "Expected_Lifespan_Est": 10,
            "MTBF": 8760.0,
            "Cost_Per_Hour": 0.05,
            "Lifespan_Usage_Ratio": 0.1,
            "Maintenance_Report": "No issues."
        },
        {
            "Device_ID": "MD-TEST-002",
            "Device_Type": "Defibrillator",
            "Purchase_Date": "2020-05-15",
            "Age": 5,
            "Manufacturer": "RescueTech",
            "Model": "Model-450",
            "Country": "UK",
            "Maintenance_Cost": 4500.00,
            "Downtime": 12.0,
            "Maintenance_Frequency": 3,
            "Failure_Event_Count": 2,
            "Maintenance_Class": 2,
            "Operational_Hours_Est": 43800,
            "Expected_Lifespan_Est": 10,
            "MTBF": 14600.0,
            "Cost_Per_Hour": 0.10,
            "Lifespan_Usage_Ratio": 0.5,
            "Maintenance_Report": "Battery replaced."
        },
        {
            "Device_ID": "MD-TEST-003",
            "Device_Type": "MRI Scanner",
            "Purchase_Date": "2012-11-20",
            "Age": 13,
            "Manufacturer": "ImagingTech",
            "Model": "Model-900",
            "Country": "USA",
            "Maintenance_Cost": 150000.00,
            "Downtime": 120.5,
            "Maintenance_Frequency": 8,
            "Failure_Event_Count": 6,
            "Maintenance_Class": 4,
            "Operational_Hours_Est": 113880,
            "Expected_Lifespan_Est": 12,
            "MTBF": 1626.0,
            "Cost_Per_Hour": 1.31,
            "Lifespan_Usage_Ratio": 1.08,
            "Maintenance_Report": "Frequent cooling failures."
        }
    ]
    
    df = pd.DataFrame(data)
    df.to_csv(input_path, index=False)
    print(f"Created sample test data at '{input_path}'\\n")
    return df

def test_model(input_path="data/examples/example_risk_input.csv", output_path="data/examples/example_risk_predictions.csv"):
    # 1. Check if artifacts exist
    prep_path = "artifacts/rf_risk_preprocessor.joblib"
    model_path = "artifacts/rf_risk_classifier.joblib"
    
    if not os.path.exists(prep_path) or not os.path.exists(model_path):
        print("Error: Could not find model artifacts. Make sure you trained the model first.")
        return
        
    # 2. Load the artifacts
    print("Loading preprocessor and model...")
    preprocessor = joblib.load(prep_path)
    model = joblib.load(model_path)
    
    # 3. Load the data
    df = pd.read_csv(input_path)
    
    # 4. Prepare data for prediction (dropping columns exactly like training)
    drop_cols = ["Device_ID", "Risk_Class", "Maintenance_Report", "Purchase_Date", "Risk_Class_Label"]
    cols_to_drop = [c for c in drop_cols if c in df.columns]
    
    X_new = df.drop(columns=cols_to_drop)
    
    # 5. Transform features
    X_processed = preprocessor.transform(X_new)
    
    # 6. Predict Risk Class and Probabilities
    predictions = model.predict(X_processed)
    probabilities = model.predict_proba(X_processed)
    
    # 7. Map labels back to human readable names
    risk_mapping = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}
    
    results_df = df[["Device_ID", "Device_Type", "Age", "Cost_Per_Hour", "MTBF"]].copy()
    results_df["Predicted_Risk_Label"] = predictions
    results_df["Predicted_Risk_Class"] = results_df["Predicted_Risk_Label"].map(risk_mapping)
    results_df["Confidence_Score"] = probabilities.max(axis=1) # Get the highest probability
    
    # 8. Save and Display
    results_df.to_csv(output_path, index=False)
    print(f"\\nPredictions successfully saved to '{output_path}'")
    print("-" * 60)
    print(results_df.to_string(index=False))
    print("-" * 60)

if __name__ == "__main__":
    create_example_data()
    test_model()
