# src/data/collect_sample.py
"""
Run to collect a very small demo session (keystrokes + mouse + active window + face).
This is a convenience file for quick local testing — for a production dataset you should
implement a proper consent & labeling UI and robust storage.

Usage: python src/data/collect_sample.py
"""
import time, json, threading
from datetime import datetime
from pynput import keyboard, mouse
import getpass
import os
import cv2
import mediapipe as mp

OUT_DIR = "dataset/raw_demo"
os.makedirs(OUT_DIR, exist_ok=True)

session = {
    'keystrokes': [],
    'mouse': [],
    'screen': [],
    'face': []
}

start_time = time.time()

# keyboard
def on_press(key):
    try:
        k = key.char
    except AttributeError:
        k = str(key)
    session['keystrokes'].append({'type':'key_down','key':k,'ts':time.time() - start_time})
def on_release(key):
    try:
        k = key.char
    except AttributeError:
        k = str(key)
    session['keystrokes'].append({'type':'key_up','key':k,'ts':time.time() - start_time})

# mouse
def on_move(x, y):
    session['mouse'].append({'type':'mouse_move','x':x,'y':y,'ts':time.time() - start_time})
def on_click(x, y, button, pressed):
    session['mouse'].append({'type':'mouse_click','x':x,'y':y,'button':str(button),'pressed':pressed,'ts':time.time() - start_time})

kb_listener = keyboard.Listener(on_press=on_press, on_release=on_release)
ms_listener = mouse.Listener(on_move=on_move, on_click=on_click)

def capture_camera(duration=20):
    mp_face = mp.solutions.face_mesh
    cap = cv2.VideoCapture(0)
    with mp_face.FaceMesh(static_image_mode=False, max_num_faces=1) as face_mesh:
        t0 = time.time()
        while time.time() - t0 < duration:
            ok, frame = cap.read()
            if not ok:
                break
            # convert to RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = face_mesh.process(rgb)
            ts = time.time() - start_time
            if res.multi_face_landmarks:
                # simple proxies
                lm = res.multi_face_landmarks[0]
                # placeholder calculations: compute mouth_open and eye_aspect
                # Here we implement a simple ratio-based proxies using landmark indices
                # These indices are from MediaPipe face mesh; for production verify indices
                # (this is illustrative)
                try:
                    # choose landmarks for upper/lower lip and eye corners roughly
                    upper_lip = lm.landmark[13]   # approximate
                    lower_lip = lm.landmark[14]
                    mouth_open = abs(upper_lip.y - lower_lip.y)
                    left_eye_top = lm.landmark[159]
                    left_eye_bottom = lm.landmark[145]
                    eye_aspect = abs(left_eye_top.y - left_eye_bottom.y)
                    # eyebrow difference with eye reference
                    brow_point = lm.landmark[105]
                    eyebrow_diff = abs(brow_point.y - left_eye_top.y)
                except Exception:
                    mouth_open = 0.0; eye_aspect = 0.0; eyebrow_diff = 0.0
                session['face'].append({'ts':ts,'eye_aspect':eye_aspect,'mouth_open':mouth_open,'eyebrow_diff':eyebrow_diff})
    cap.release()

def fake_active_window_poller(duration=20):
    # quick mock: record a 'window' every 2 seconds (in real: use pygetwindow or platform API)
    import random
    titles = ['Chrome', 'VSCode', 'Slack', 'Terminal', 'Email']
    t0 = time.time()
    while time.time() - t0 < duration:
        session['screen'].append({'type':'active_window', 'title': titles[int(time.time()) % len(titles)], 'ts': time.time() - start_time})
        time.sleep(2)

if __name__ == "__main__":
    D = 20  # seconds
    print("Starting demo collection for", D, "seconds. Focus on the screen and type/move mouse.")
    kb_listener.start()
    ms_listener.start()
    cam_thread = threading.Thread(target=capture_camera, args=(D,), daemon=True)
    cam_thread.start()
    screen_thread = threading.Thread(target=fake_active_window_poller, args=(D,), daemon=True)
    screen_thread.start()
    time.sleep(D + 1)
    kb_listener.stop()
    ms_listener.stop()
    # save session
    fname = f"{OUT_DIR}/session_{int(time.time())}.json"
    with open(fname, "w", encoding="utf-8") as f:
        json.dump(session, f, default=list, indent=2)
    print("Saved demo session to", fname)
