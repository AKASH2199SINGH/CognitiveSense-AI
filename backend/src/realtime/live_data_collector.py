import time
import csv
import os

from src.realtime.aggregator import RealTimeAggregator

OUTPUT_CSV = "dataset/live_collected.csv"
WINDOW_SEC = 3


def main():
    os.makedirs("dataset", exist_ok=True)

    print("\n🧠 CognitiveSense – Live Data Collector")
    print("Labels:")
    print("  0 → Normal")
    print("  1 → Stressed")
    print("  2 → Fatigued\n")

    label = int(input("Enter label for this session (0/1/2): "))

    agg = RealTimeAggregator()
    agg.start()

    print("\n⏺️ Collecting data... Press CTRL+C to stop.\n")

    with open(OUTPUT_CSV, "a", newline="") as f:
        writer = None

        try:
            while True:
                features = agg.collect_features(label=label)

                if writer is None:
                    writer = csv.DictWriter(
                        f, fieldnames=features.keys()
                    )
                    if f.tell() == 0:
                        writer.writeheader()

                writer.writerow(features)
                f.flush()

                print(f"✅ Saved window | label={label}")
                time.sleep(WINDOW_SEC)

        except KeyboardInterrupt:
            print("\n🛑 Stopped data collection.")


if __name__ == "__main__":
    main()
