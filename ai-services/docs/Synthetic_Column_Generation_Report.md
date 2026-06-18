# Synthetic Column Generation Report

## Objective
This report explains how the synthetic time-series columns were created for predictive maintenance modeling, especially for forecasting failures up to 72 hours ahead.

The generation process uses the real device-level dataset (`Medical_Device_Failure_dataset.csv`) and anchors simulated behavior to each device's failure intensity (`Failure_Event_Count`).

## Input Data Used
- `Device_ID`
- `Failure_Event_Count`
- `Age` (if present)
- `Maintenance_Report` (if present, used for electrical-failure hints)

## Simulation Window
- 365 daily records per device.
- Time index: from `today - 364 days` to `today`.
- Output table: one row per device per day.

## Failure Anchoring Logic
For each device:
1. Read `Failure_Event_Count = n`.
2. Place `n` synthetic failure days across the 365-day window using evenly spaced anchors with small random jitter.
3. Treat those days as "upcoming failure events" that drive sensor degradation patterns.

If `n = 0`, no failure events are scheduled for that device.

## Device Wear Baseline
If `Age` exists, a wear factor is applied:
- `wear = 1 + (Age / 20)`

This increases base sensor stress for older devices.

## Synthetic Columns and Formulas

### 1) `Simulated_Temperature_Variance`
Base behavior:
- Device-level baseline + Gaussian noise.

Failure proximity behavior:
- If next failure is within 10 days, temperature variance increases progressively.
- Closer to failure -> larger increase.

Interpretation:
- Higher variance indicates thermal instability often observed before failures.

### 2) `Simulated_Motor_Vibration_Hz`
Base behavior:
- Device-level baseline vibration + Gaussian noise.

Failure proximity behavior:
- Strong ramp-up inside the last 7 days before a failure.
- This explicitly models the requested 5-7 day pre-failure rise.

Interpretation:
- Elevated vibration is a common mechanical degradation signal.

### 3) `Simulated_Voltage_Drop`
Base behavior:
- Small positive baseline drop with light noise.

Failure proximity behavior:
- Inside the last 7 days before failure, random voltage-drop spikes occur.
- Spike probability/amplitude are higher for likely electrical devices.

Electrical hint detection:
- If `Maintenance_Report` contains keywords like `voltage`, `circuit`, `power`, `electrical`, the device is treated as more likely electrical-failure-prone.

Interpretation:
- Captures sporadic electrical instability before failures.

### 4) `RUL_Hours`, `RUL_Days`, and `RUL`
Definition:
- Remaining Useful Life to the next scheduled failure event.

Computation:
- `RUL_Hours = (next_failure_day_index - current_day_index) * 24`
- `RUL_Days = RUL_Hours / 24`
- `RUL` is an alias of `RUL_Days` for direct target training.

No upcoming failure in window:
- `RUL_Hours` is filled with `9999`
- `RUL_Days` is filled with `416.625`

This keeps the dataset numeric and marks "far from failure" periods.

### 5) False Flags (Non-failure anomalies)
To reduce overfitting to perfect patterns, random one-day spikes are injected on days that are not near a failure window:
- Temperature false flags: low probability, sharp temporary increase.
- Vibration false flags: low probability, sharp temporary increase.

This helps the model learn that isolated anomalies are not always failure precursors.

### 6) Device-Type-Specific Baselines
`Device_Type` controls baseline sensor behavior before failure dynamics are applied.  
Examples:
- MRI: higher baseline voltage drop, lower vibration.
- Infusion Pump / Defibrillator: higher baseline vibration.

This improves realism by avoiding a one-profile-fits-all simulation.

## Target Label Derived From RUL
For sequence models:
- `Will_Fail_In_72_Hours = 1 if RUL_Hours <= 72 else 0`

This creates the binary training label for near-term failure prediction.

## Reproducibility
- Random seed is fixed (`seed = 42`) to make synthetic generation deterministic across runs (unless changed by user).

## Output Datasets
After full pipeline execution:
- `processed_device_level.csv` (device-level engineered and labeled data)
- `processed_timeseries_level.csv` (time-series synthetic data with RUL and 72-hour label)

## Notes and Assumptions
- Because the source dataset is not true IoT telemetry, signals are synthetic and behavior-driven.
- Failure dates are simulated from failure counts, not recovered from actual timestamps.
- The generator is suitable for model prototyping and workflow validation; real sensor logs should replace synthetic telemetry for production deployment.
