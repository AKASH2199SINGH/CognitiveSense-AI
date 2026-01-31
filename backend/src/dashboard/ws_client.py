# import json
# import threading
# import time
# from websocket import create_connection, WebSocketTimeoutException

# # WS_URL = "ws://127.0.0.1:8000/ws/live"
# WS_URL = "ws://127.0.0.1:8000/ws/live"


# _latest_data = None
# _lock = threading.Lock()
# _thread = None
# _running = False


# def _ws_loop():
#     global _latest_data, _running

#     while _running:
#         ws = None
#         try:
#             print("🔌 Connecting to WS...")
#             ws = create_connection(
#                 WS_URL,
#                 timeout=10,
#                 ping_interval=20,
#                 ping_timeout=10
#             )
#             print("🟢 WS connected")

#             while _running:
#                 try:
#                     msg = ws.recv()
#                     if not msg:
#                         continue

#                     data = json.loads(msg)
#                     with _lock:
#                         _latest_data = data

#                 except WebSocketTimeoutException:
#                     continue

#         except Exception as e:
#             print("⚠️ WS error:", e)
#             time.sleep(3)

#         finally:
#             if ws:
#                 try:
#                     ws.close()
#                 except Exception:
#                     pass
#             print("🔁 Reconnecting WS...")


# def start_ws_client():
#     global _thread, _running

#     if _thread and _thread.is_alive():
#         return  # already running

#     _running = True
#     _thread = threading.Thread(target=_ws_loop, daemon=True)
#     _thread.start()


# def stop_ws_client():
#     global _running
#     _running = False


# def get_latest_data():
#     with _lock:
#         return _latest_data
