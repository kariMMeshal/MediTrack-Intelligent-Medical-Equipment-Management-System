import argparse
import numpy as np
import pandas as pd


ELECTRICAL_KWS = ["voltage", "circuit", "power", "electrical"]
DEVICE_TYPE_BASELINES = {
    # temp_var, vibration_hz, voltage_drop
    "MRI Scanner": (0.85, 17.0, 0.70),
    "CT Scanner": (0.80, 20.0, 0.65),
    "X-Ray Machine": (0.75, 23.0, 0.60),
    "PET Scanner": (0.78, 21.0, 0.62),
    "Defibrillator": (0.68, 26.0, 0.50),
    "Infusion Pump": (0.62, 27.5, 0.45),
}


def has_electrical_pattern(text):
    if not isinstance(text, str):
        return False
    t = text.lower()
    return any(k in t for k in ELECTRICAL_KWS)


def schedule_failure_days(n_failures, n_days, rng):
    n = int(max(0, n_failures))
    if n == 0:
        return []
    n = min(n, n_days)
    anchors = np.linspace(30, n_days - 1, n).astype(int)
    jitter = rng.integers(-4, 5, size=n)
    days = np.clip(anchors + jitter, 0, n_days - 1)
    return sorted(np.unique(days).tolist())


def next_failure_in_hours(day_idx, failure_idxs):
    future = [f for f in failure_idxs if f >= day_idx]
    if not future:
        return np.nan
    return float((future[0] - day_idx) * 24)


def is_near_failure(days_to_next, near_window=10):
    return pd.notna(days_to_next) and days_to_next <= near_window


def generate_timeseries(df, seed=42, n_days=365):
    rng = np.random.default_rng(seed)
    sim_end = pd.Timestamp.today().normalize()
    sim_start = sim_end - pd.Timedelta(days=n_days - 1)
    all_days = pd.date_range(sim_start, sim_end, freq="D")

    rows = []
    age_col = "Age" if "Age" in df.columns else None
    report_col = "Maintenance_Report" if "Maintenance_Report" in df.columns else None

    device_type_col = "Device_Type" if "Device_Type" in df.columns else None

    for _, dev in df.iterrows():
        device_id = dev["Device_ID"]
        failure_count = dev["Failure_Event_Count"]
        is_electrical = has_electrical_pattern(dev[report_col]) if report_col else False
        device_type = dev[device_type_col] if device_type_col else "Unknown"

        age_factor = float(dev[age_col]) if age_col else 5.0
        wear = 1.0 + (age_factor / 20.0)
        d_temp, d_vib, d_volt = DEVICE_TYPE_BASELINES.get(device_type, (0.70, 25.0, 0.50))
        temp_base = rng.normal(d_temp, 0.10) * wear
        vib_base = rng.normal(d_vib, 2.0) * wear
        volt_base = rng.normal(d_volt, 0.08) * wear

        failure_day_idxs = schedule_failure_days(failure_count, len(all_days), rng)

        for i, ts in enumerate(all_days):
            future = [f for f in failure_day_idxs if f >= i]
            days_to_next = (future[0] - i) if future else np.nan

            temp = temp_base + rng.normal(0, 0.08)
            vib = vib_base + rng.normal(0, 0.9)
            vdrop = max(0.0, volt_base + rng.normal(0, 0.05))

            if not np.isnan(days_to_next):
                if days_to_next <= 10:
                    temp += (10 - days_to_next) * rng.uniform(0.08, 0.18)
                if days_to_next <= 7:
                    vib += (7 - days_to_next + 1) * rng.uniform(0.7, 1.4)
                    prob_spike = 0.45 if is_electrical else 0.20
                    if rng.random() < prob_spike:
                        vdrop += rng.uniform(0.35, 1.1 if is_electrical else 0.7)

            # False flags: random one-day anomalies away from failure periods.
            if not is_near_failure(days_to_next, near_window=10):
                if rng.random() < 0.015:
                    temp += rng.uniform(0.4, 1.2)
                if rng.random() < 0.020:
                    vib += rng.uniform(4.0, 11.0)

            temp = max(0.01, temp)
            vib = max(0.01, vib)
            rul_hours = next_failure_in_hours(i, failure_day_idxs)
            rul_days = (rul_hours / 24.0) if pd.notna(rul_hours) else np.nan

            rows.append(
                {
                    "Device_ID": device_id,
                    "Device_Type": device_type,
                    "Timestamp": ts,
                    "Simulated_Temperature_Variance": float(temp),
                    "Simulated_Motor_Vibration_Hz": float(vib),
                    "Simulated_Voltage_Drop": float(vdrop),
                    "RUL_Hours": rul_hours,
                    "RUL_Days": rul_days,
                    "RUL": rul_days,
                    "Will_Fail_In_72_Hours": int(pd.notna(rul_hours) and rul_hours <= 72),
                }
            )

    ts_df = pd.DataFrame(rows)
    ts_df["RUL_Hours"] = ts_df["RUL_Hours"].fillna(9999.0)
    ts_df["RUL_Days"] = ts_df["RUL_Days"].fillna(9999.0 / 24.0)
    ts_df["RUL"] = ts_df["RUL"].fillna(9999.0 / 24.0)
    return ts_df


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic IoT time-series logs.")
    parser.add_argument("--input", default="data/raw/Medical_Device_Failure_dataset.csv", help="Input device-level CSV")
    parser.add_argument("--output", default="data/examples/synthetic_device_timeseries.csv", help="Output timeseries CSV")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--days", type=int, default=365, help="Days per device to simulate")
    args = parser.parse_args()

    df = pd.read_csv(args.input)
    required = {"Device_ID", "Failure_Event_Count"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    ts_df = generate_timeseries(df, seed=args.seed, n_days=args.days)
    ts_df.to_csv(args.output, index=False)
    print(f"Saved {len(ts_df)} rows to {args.output}")


if __name__ == "__main__":
    main()
