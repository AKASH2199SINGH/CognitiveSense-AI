from pynput import mouse
import time
import math

class MouseCollector:
    def __init__(self):
        self.positions = []
        self.clicks = 0

    def on_move(self, x, y):
        self.positions.append((x, y, time.time()))

    def on_click(self, x, y, button, pressed):
        if pressed:
            self.clicks += 1

    def start(self):
        self.listener = mouse.Listener(
            on_move=self.on_move,
            on_click=self.on_click
        )
        self.listener.start()

    def flush(self):
        speed = []
        for i in range(1, len(self.positions)):
            x1, y1, t1 = self.positions[i - 1]
            x2, y2, t2 = self.positions[i]
            dist = math.hypot(x2 - x1, y2 - y1)
            dt = t2 - t1
            if dt > 0:
                speed.append(dist / dt)

        data = {
            "mouse_speed_mean": sum(speed) / max(len(speed), 1),
            "mouse_clicks": self.clicks
        }
        self.__init__()
        return data
