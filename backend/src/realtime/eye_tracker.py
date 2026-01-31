import cv2
import time
import numpy as np
import threading

try:
    import mediapipe as mp
    MP_AVAILABLE = True
except:
    MP_AVAILABLE = False


class EyeTracker:
    def __init__(self):
        self.safe_mode = not MP_AVAILABLE
        self.ear_values = []
        self.blink_count = 0
        self.prev_ear = None

        # thresholds
        self.BLINK_THRESH = 0.21
        self.MIN_BLINK_GAP = 0.25
        self.last_blink_time = 0

        if self.safe_mode:
            print("⚠️ EyeTracker SAFE MODE (mediapipe not available)")
            return

        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("❌ Camera not accessible → SAFE MODE")
            self.safe_mode = True
            return

        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True
        )

        # 🔥 START BACKGROUND THREAD
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

        print("✅ EyeTracker REAL MODE started")

    # --------------------------------------------------
    # BACKGROUND CAMERA LOOP (VERY IMPORTANT)
    # --------------------------------------------------
    def _run(self):
        while self.running:
            self.update()
            time.sleep(0.03)  # ~30 FPS

    def update(self):
        if self.safe_mode:
            return

        ret, frame = self.cap.read()
        if not ret:
            return

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(frame_rgb)

        if not results.multi_face_landmarks:
            return

        landmarks = results.multi_face_landmarks[0].landmark

        # LEFT EYE landmarks
        eye_ids = [33, 160, 158, 133, 153, 144]
        eye = [(landmarks[i].x, landmarks[i].y) for i in eye_ids]

        ear = self._compute_ear(eye)
        self.ear_values.append(ear)

        # -------- BLINK DETECTION --------
        now = time.time()
        if ear < self.BLINK_THRESH:
            if self.prev_ear and self.prev_ear >= self.BLINK_THRESH:
                if now - self.last_blink_time > self.MIN_BLINK_GAP:
                    self.blink_count += 1
                    self.last_blink_time = now

        self.prev_ear = ear

    def _compute_ear(self, eye):
        A = np.linalg.norm(np.array(eye[1]) - np.array(eye[5]))
        B = np.linalg.norm(np.array(eye[2]) - np.array(eye[4]))
        C = np.linalg.norm(np.array(eye[0]) - np.array(eye[3]))
        return (A + B) / (2.0 * C)

    # --------------------------------------------------
    # WINDOW FLUSH (called by aggregator)
    # --------------------------------------------------
    def flush(self):
        if not self.ear_values:
            return {
                "eye_aspect_mean": 0.0,
                "eye_blink_rate": 0
            }

        mean_ear = float(np.mean(self.ear_values))
        blinks = int(self.blink_count)

        # reset window
        self.ear_values = []
        self.blink_count = 0
        self.prev_ear = None

        return {
            "eye_aspect_mean": mean_ear,
            "eye_blink_rate": blinks
        }
