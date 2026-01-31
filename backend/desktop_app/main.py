import webview
import threading
import pystray
from PIL import Image
import sys
import time
import ctypes
import os

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# ================= PATH FIX =================
def resource_path(relative):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative)
    return os.path.join(os.path.abspath("."), relative)

ICON_PATH = resource_path("icon.ico")

# ================= WINDOWS HARD TOPMOST =================
def hard_force_topmost(title):
    HWND_TOPMOST = -1
    SWP_NOMOVE = 0x0002
    SWP_NOSIZE = 0x0001
    SWP_SHOWWINDOW = 0x0040

    hwnd = user32.FindWindowW(None, title)
    if not hwnd:
        return

    # Attach input threads (CRITICAL)
    fg = user32.GetForegroundWindow()
    fg_thread = user32.GetWindowThreadProcessId(fg, None)
    this_thread = kernel32.GetCurrentThreadId()

    user32.AttachThreadInput(this_thread, fg_thread, True)

    user32.SetWindowPos(
        hwnd,
        HWND_TOPMOST,
        0, 0, 0, 0,
        SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW
    )

    user32.SetForegroundWindow(hwnd)

    user32.AttachThreadInput(this_thread, fg_thread, False)

# ================= TRAY =================
def quit_app(icon, item):
    icon.stop()
    os._exit(0)

def tray():
    image = Image.open(ICON_PATH)
    menu = pystray.Menu(
        pystray.MenuItem("Quit", quit_app)
    )
    icon = pystray.Icon(
        "CognitiveSense",
        image,
        "CognitiveSense AI",
        menu
    )
    icon.run()

def start_tray():
    threading.Thread(target=tray, daemon=True).start()

# ================= MAIN =================
if __name__ == "__main__":
    start_tray()

    TITLE = "CognitiveSense PiP"

    webview.create_window(
        TITLE,
        url=resource_path("pip_view.html"),
        width=260,
        height=140,
        frameless=True,
        easy_drag=True,
        resizable=False,
        always_on_top=True  # harmless if ignored
    )

    # 🔥 HARD LOCK LOOP (VERY IMPORTANT)
    def z_order_lock():
        time.sleep(1)
        while True:
            hard_force_topmost(TITLE)
            time.sleep(0.1)  # 100ms lock

    threading.Thread(target=z_order_lock, daemon=True).start()

    webview.start(gui="edgechromium")
