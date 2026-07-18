import pandas as pd
from sklearn.preprocessing import StandardScaler

def load_data(train_path, test_path, rul_path):
    train = pd.read_csv(train_path, sep=" ", header=None).dropna(axis=1)
    cols = ["engine_id", "cycle"] + [f"op{i}" for i in range(1,4)] + [f"s{i}" for i in range(1,22)]
    train.columns = cols

    max_cycle = train.groupby("engine_id")["cycle"].max()
    train["RUL"] = train.apply(lambda row: max_cycle[row["engine_id"]] - row["cycle"], axis=1)

    test = pd.read_csv(test_path, sep=" ", header=None).dropna(axis=1)
    test.columns = cols

    rul = pd.read_csv(rul_path, header=None)

    test_rul = []
    for i, engine in enumerate(test["engine_id"].unique()):
        engine_data = test[test["engine_id"] == engine].copy()
        last_cycle = engine_data["cycle"].max()
        total_life = last_cycle + rul.iloc[i, 0]
        engine_data["RUL"] = total_life - engine_data["cycle"]
        test_rul.append(engine_data)

    test = pd.concat(test_rul)

    # DYNAMIC SENSOR DROPPING: Only drop for FD001 and FD003
    if "FD001" in train_path or "FD003" in train_path:
        drop_sensors = ["s1", "s5", "s6", "s10", "s16", "s18", "s19"]
        train = train.drop(columns=drop_sensors)
        test = test.drop(columns=drop_sensors)

    # Piecewise linear degradation: RUL Capping at 125
    train["RUL"] = train["RUL"].clip(upper=125)
    test["RUL"] = test["RUL"].clip(upper=125)

    return train, test

def scale_data(train, test):
    features = train.drop(["engine_id", "cycle", "RUL"], axis=1).columns
    scaler = StandardScaler()
    
    train[features] = scaler.fit_transform(train[features])
    test[features] = scaler.transform(test[features])

    return train, test, scaler