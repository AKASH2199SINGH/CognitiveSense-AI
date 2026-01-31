import pandas as pd

# load live collected data
df = pd.read_csv("dataset/live_collected.csv")

# shuffle data (important for ML)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# save final dataset
df.to_csv("dataset/final_dataset.csv", index=False)

print("✅ Final dataset created")
print("Total rows:", len(df))
print("Label distribution:")
print(df["label"].value_counts())
