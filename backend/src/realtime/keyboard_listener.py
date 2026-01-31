from pynput import keyboard
import time
from collections import defaultdict

class KeyboardCollector:
    def __init__(self):
        self.press_times = {}
        self.dwell_times = []
        self.flight_times = []
        self.keys_pressed = []
        self.last_release_time = None

    def on_press(self, key):
        t = time.time()
        self.press_times[key] = t
        self.keys_pressed.append(key)

        if self.last_release_time:
            self.flight_times.append(t - self.last_release_time)

    def on_release(self, key):
        t = time.time()
        if key in self.press_times:
            self.dwell_times.append(t - self.press_times[key])
            del self.press_times[key]
        self.last_release_time = t

    def start(self):
        self.listener = keyboard.Listener(
            on_press=self.on_press,
            on_release=self.on_release
        )
        self.listener.start()

    def flush(self):
        data = {
            "key_count": len(self.keys_pressed),
            "unique_keys": len(set(self.keys_pressed)),
            "dwell_mean": sum(self.dwell_times) / max(len(self.dwell_times), 1),
            "flight_mean": sum(self.flight_times) / max(len(self.flight_times), 1),
            "key_rate": len(self.keys_pressed) / 3.0
        }
        self.__init__()  # reset
        return data
