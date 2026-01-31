# # import streamlit as st
# # import pandas as pd
# # import time
# # import sys
# # import os
# # import altair as alt

# # from streamlit_autorefresh import st_autorefresh

# # sys.path.append(os.path.abspath("."))

# # from src.dashboard.ws_client import start_ws_client, get_latest_data

# # # ================= PAGE CONFIG =================
# # st.set_page_config(
# #     page_title="CognitiveSense AI – Live Dashboard",
# #     layout="wide"
# # )

# # # ================= START WS CLIENT =================
# # if "ws_started" not in st.session_state:
# #     start_ws_client()
# #     st.session_state.ws_started = True

# #     # ================= SMOOTH INTERPOLATION =================
# # def smooth_value(key, new_value, alpha=0.2):
# #     """
# #     Smoothly interpolate values for UI animations
# #     alpha: lower = smoother, higher = faster
# #     """
# #     if key not in st.session_state:
# #         st.session_state[key] = new_value
# #     else:
# #         st.session_state[key] = (
# #             st.session_state[key] * (1 - alpha)
# #             + new_value * alpha
# #         )
# #     return st.session_state[key]

# # #   tooltip

# # def tip(label: str, help_text: str):
# #     st.markdown(
# #         f"""
# #         <span title="{help_text}"
# #               style="cursor:help;border-bottom:1px dotted #666;">
# #             {label}
# #         </span>
# #         """,
# #         unsafe_allow_html=True
# #     )
# # # ================= SESSION LOG =================
# # if "session_log" not in st.session_state:
# #     st.session_state.session_log = []



# # # ================= AUTO REFRESH =================
# # st_autorefresh(interval=600, key="live_refresh")

# # # ================= PREMIUM CSS =================
# # st.markdown("""
# # <style>
# # body {
# #     background: radial-gradient(circle at top, #141824, #0b0e14);
# #     color: #ffffff;
# # }

# # .glass {
# #     background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
# #     border-radius: 20px;
# #     padding: 18px;
# #     min-height: 140px;
# #     backdrop-filter: blur(14px);
# #     border: 1px solid rgba(255,255,255,0.12);
# #     box-shadow: 0 20px 40px rgba(0,0,0,0.35);
# # }

# # @keyframes brainPulse {
# #   0% { transform: scale(0.95); opacity: 0.6; }
# #   50% { transform: scale(1.05); opacity: 1; }
# #   100% { transform: scale(0.95); opacity: 0.6; }
# # }

# # .brain-box {
# #   height: 120px;
# #   border-radius: 18px;
# #   display: flex;
# #   align-items: center;
# #   justify-content: center;
# #   animation: brainPulse 2.5s infinite;
# #   font-size: 64px;
# # }

# # .small-text {
# #     font-size: 13px;
# #     opacity: 0.8;
# # }

# # .pip-box {
# #     position: fixed;
# #     bottom: 22px;
# #     right: 22px;
# #     width: 260px;
# #     background: linear-gradient(160deg, rgba(25,25,25,0.95), rgba(10,10,10,0.9));
# #     border-radius: 16px;
# #     padding: 16px;
# #     z-index: 9999;
# # }
# # /* ================= MICRO ANIMATIONS ================= */

# # .glass {
# #     transition: transform 0.25s ease, box-shadow 0.25s ease;
# # }

# # .glass:hover {
# #     transform: translateY(-6px);
# #     box-shadow: 0 30px 60px rgba(0,0,0,0.45);
# # }

# # .progress-bar > div {
# #     transition: width 0.4s ease-in-out;
# # }

# # </style>
# # """, unsafe_allow_html=True)

# # # ================= HEADER =================
# # st.markdown("## 🧠 **CognitiveSense AI**")
# # st.caption("Real-time Cognitive • Attention • Fatigue Monitoring")

# # # ================= SIDEBAR =================
# # st.sidebar.header("⚙️ Controls")
# # start = st.sidebar.toggle("🟢 Start Live Monitoring", value=False)
# # pip_mode = st.sidebar.toggle("🪟 Floating PiP Mode", value=True)
# # alert_mode = st.sidebar.toggle("🔊 Sound Alerts", value=True)

# # # ================= SESSION STATE =================
# # if "history" not in st.session_state:
# #     st.session_state.history = pd.DataFrame(columns=["time", "fatigue"])

# # if "last_alert" not in st.session_state:
# #     st.session_state.last_alert = 0

# # # ================= HELPERS =================
# # def attention_score(conf, fatigue, label):
# #     score = conf * 100 - fatigue * 0.7
# #     if label == "Stressed":
# #         score -= 10
# #     if label == "Fatigued":
# #         score -= 20
# #     return max(0, int(score))

# # # ================= START =================
# # if not start:
# #     st.info("▶ Toggle **Start Live Monitoring** to begin.")
# #     st.stop()

# # data = get_latest_data()
# # if data is None:
# #     st.warning("⏳ Waiting for live data from backend…")
# #     st.stop()

# # label = data.get("label_name", "Unknown")
# # confidence = float(data.get("confidence", 0))
# # fatigue = int(data.get("features", {}).get("fatigue_score", 0))
# # attention = attention_score(confidence, fatigue, label)

# # # Smooth UI values (frontend only)
# # ui_confidence = smooth_value("ui_confidence", confidence * 100)
# # ui_fatigue = smooth_value("ui_fatigue", fatigue)
# # ui_attention = smooth_value("ui_attention", attention)


# # # ======================================================
# # # ROW 1 — TOP VISUAL ONLY (NOW WORKING)
# # # ======================================================
# # v1, v2, v3 = st.columns([1.1, 1.8, 1.1])

# # # ======================================================
# # # ROW 1 — TOP VISUAL CARDS
# # # ======================================================
# # # 🧠 Brain Animation
# # with v1:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)

# #     ui_fatigue = smooth_value("ui_fatigue", fatigue)
# #     ui_attention = smooth_value("ui_attention", attention)

# #     pulse_speed = max(1.2, 3 - (ui_attention / 50))
# #     brain_color = (
# #         "#ff6b6b" if ui_fatigue > 70
# #         else "#ffb347" if ui_fatigue > 40
# #         else "#4cff9f"
# #     )

# #     st.markdown(f"""
# #         <div class="brain-box"
# #              style="
# #              animation-duration:{pulse_speed}s;
# #              background:radial-gradient(circle,{brain_color}55 0%,transparent 65%);
# #              color:{brain_color};">
# #             🧠
# #         </div>

# #         <div class="small-text">
# #             {tip("Cognitive Load", "Overall mental effort estimated from fatigue signals")}
# #             : <b>{int(ui_fatigue)}/100</b><br>
# #             {tip("Attention", "Focus score derived from interaction and eye metrics")}
# #             : <b>{int(ui_attention)}/100</b>
# #         </div>
# #     """, unsafe_allow_html=True)

# #     st.markdown("</div>", unsafe_allow_html=True)



# # # 👁️ Visual Preview
# # with v2:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)
# #     st.subheader("👁️ Visual Preview")

# #     eye_aspect = data["features"].get("eye_aspect_mean", 0)
# #     blink_rate = data["features"].get("eye_blink_rate", 0)

# #     state = "Focused 👀" if eye_aspect > 0.32 else "Drowsy 😴"
# #     st.markdown("---")
# #     st.markdown("🎥 **Live Webcam Preview**")

# #     cam = st.camera_input(
# #         "Enable camera",
# #         label_visibility="collapsed"
# #     )

# #     if cam:
# #         st.caption("Live frame captured (frontend only)")


# #     st.markdown(f"""
# #         <div style="
# #             height:120px;
# #             display:flex;
# #             flex-direction:column;
# #             align-items:center;
# #             justify-content:center;
# #             gap:6px;">

# #             <div style="font-size:20px">{state}</div>

# #             <div class="small-text">
# #                 {tip("Blink rate", "Higher blink rate may indicate fatigue or eye strain")}
# #                 : {blink_rate}
# #             </div>

# #             <div class="small-text">
# #                 {tip("Eye aspect", "Eye openness ratio (lower values indicate drowsiness)")}
# #                 : {eye_aspect:.2f}
# #             </div>
# #         </div>
# #     """, unsafe_allow_html=True)

# #     st.markdown("</div>", unsafe_allow_html=True)



# # # ⌨️ Input Heat
# # with v3:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)
# #     st.subheader("⌨️ Input Heat")

# #     key_rate = data["features"].get("key_rate", 0)
# #     mouse_speed = data["features"].get("mouse_speed_mean", 0)

# #     ui_key = smooth_value("ui_key_rate", key_rate * 100)
# #     ui_mouse = smooth_value("ui_mouse_speed", mouse_speed / 15)

# #     st.progress(min(100, int(ui_key)))
# #     st.caption(
# #         f"{tip('Typing rate', 'Keys per second — high values indicate cognitive load')}: {key_rate:.2f}",
# #         unsafe_allow_html=True
# #     )

# #     st.progress(min(100, int(ui_mouse)))
# #     st.caption(
# #         f"{tip('Mouse speed', 'Cursor movement speed — jitter suggests stress')}: {int(mouse_speed)}",
# #         unsafe_allow_html=True
# #     )
# #     st.markdown("---")
# #     st.markdown("🔥 **Interaction Heat**")

# #     heat_intensity = min(100, int((ui_key + ui_mouse) / 2))

# #     st.markdown(
# #         f"""
# #         <div style="
# #             height:90px;
# #             border-radius:14px;
# #             background:radial-gradient(
# #                 circle at center,
# #                 rgba(255,80,80,{heat_intensity/120}) 0%,
# #                 rgba(255,80,80,0.05) 60%,
# #                 transparent 75%
# #             );
# #             display:flex;
# #             align-items:center;
# #             justify-content:center;
# #             font-size:14px;
# #         ">
# #             Heat Level: {heat_intensity}%
# #         </div>
# #         """,
# #         unsafe_allow_html=True
# #     )


# #     st.markdown("</div>", unsafe_allow_html=True)


# # # ======================================================
# # # ROW 2 — CORE ANALYTICS (SAME DATA, CLEAN CARDS)
# # # ======================================================
# # col1, col2, col3 = st.columns([1.1, 1.8, 1.1])

# # with col1:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)

# #     ui_conf = smooth_value("ui_confidence", confidence * 100)

# #     st.markdown(f"<h2>{ui_conf:.1f}%</h2>", unsafe_allow_html=True)
# #     st.progress(int(ui_attention))
# #     st.markdown(f"Attention: {int(ui_attention)}/100")

# #     st.markdown("</div>", unsafe_allow_html=True)



# # with col2:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)
# #     st.subheader("📡 Cognitive Trend")

# #     st.session_state.history.loc[len(st.session_state.history)] = [
# #         pd.Timestamp.utcnow(), fatigue
# #     ]
# #     st.session_state.history = st.session_state.history.tail(120)

# #     st.line_chart(
# #         st.session_state.history.set_index("time")["fatigue"],
# #         height=220
# #     )
# #     st.markdown("📈 **Smoothed Fatigue Curve**")

# #     smooth_df = st.session_state.history.copy()
# #     smooth_df["fatigue"] = smooth_df["fatigue"].rolling(
# #         window=5, min_periods=1
# #     ).mean()

# #     chart = (
# #         alt.Chart(smooth_df)
# #         .mark_line(interpolate="monotone", strokeWidth=3)
# #         .encode(
# #             x=alt.X("time:T", title="Time"),
# #             y=alt.Y("fatigue:Q", title="Fatigue"),
# #             tooltip=["time:T", "fatigue:Q"]
# #         )
# #         .properties(height=220)
# #     )

# #     st.altair_chart(chart, use_container_width=True)


# #     st.markdown("</div>", unsafe_allow_html=True)


# # with col3:
# #     st.markdown("<div class='glass'>", unsafe_allow_html=True)
# #     st.subheader("⚠️ Cognitive Risk")

# #     st.progress(int(ui_fatigue))
# #     st.markdown(f"{int(ui_fatigue)}/100")

# #     st.markdown("</div>", unsafe_allow_html=True)


# # # ================= ALERT =================
# # if alert_mode and (label in ["Stressed", "Fatigued"] or fatigue > 70):
# #     if time.time() - st.session_state.last_alert > 10:
# #         st.toast("⚠️ Cognitive Alert!", icon="🚨")
# #         st.session_state.last_alert = time.time()

# import streamlit as st
# import pandas as pd
# import time
# import sys
# import os
# import altair as alt

# from streamlit_autorefresh import st_autorefresh

# sys.path.append(os.path.abspath("."))

# from src.dashboard.ws_client import start_ws_client, get_latest_data


# # ================= PAGE CONFIG =================
# st.set_page_config(
#     page_title="CognitiveSense AI – Live Dashboard",
#     layout="wide"
# )

# # ================= START WS CLIENT =================
# if "ws_started" not in st.session_state:
#     start_ws_client()
#     st.session_state.ws_started = True


# # ================= SMOOTH INTERPOLATION =================
# def smooth_value(key, new_value, alpha=0.2):
#     if key not in st.session_state:
#         st.session_state[key] = new_value
#     else:
#         st.session_state[key] = (
#             st.session_state[key] * (1 - alpha)
#             + new_value * alpha
#         )
#     return st.session_state[key]


# # ================= TOOLTIP (FIXED) =================
# def tip(label: str, help_text: str) -> str:
#     return f"""
#     <span title="{help_text}"
#           style="cursor:help;border-bottom:1px dotted #777;">
#         {label}
#     </span>
#     """


# # ================= AUTO REFRESH =================
# st_autorefresh(interval=600, key="live_refresh")


# # ================= PREMIUM CSS =================
# st.markdown("""
# <style>
# body {
#     background: radial-gradient(circle at top, #141824, #0b0e14);
#     color: #ffffff;
# }

# .glass {
#     background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03));
#     border-radius: 20px;
#     padding: 18px;
#     min-height: 160px;
#     backdrop-filter: blur(14px);
#     border: 1px solid rgba(255,255,255,0.12);
#     box-shadow: 0 20px 40px rgba(0,0,0,0.35);
#     transition: transform 0.25s ease, box-shadow 0.25s ease;
# }

# .glass:hover {
#     transform: translateY(-6px);
#     box-shadow: 0 30px 60px rgba(0,0,0,0.45);
# }

# @keyframes brainPulse {
#   0% { transform: scale(0.95); opacity: 0.6; }
#   50% { transform: scale(1.05); opacity: 1; }
#   100% { transform: scale(0.95); opacity: 0.6; }
# }

# .brain-box {
#   height: 120px;
#   border-radius: 18px;
#   display: flex;
#   align-items: center;
#   justify-content: center;
#   animation: brainPulse 2.5s infinite;
#   font-size: 64px;
# }

# .small-text {
#     font-size: 13px;
#     opacity: 0.8;
# }
# </style>
# """, unsafe_allow_html=True)


# # ================= HEADER =================
# st.markdown("## 🧠 **CognitiveSense AI**")
# st.caption("Real-time Cognitive • Attention • Fatigue Monitoring")


# # ================= SIDEBAR =================
# st.sidebar.header("⚙️ Controls")
# start = st.sidebar.toggle("🟢 Start Live Monitoring", value=False)
# alert_mode = st.sidebar.toggle("🔊 Sound Alerts", value=True)


# # ================= SESSION STATE =================
# if "history" not in st.session_state:
#     st.session_state.history = pd.DataFrame(columns=["time", "fatigue"])

# if "last_alert" not in st.session_state:
#     st.session_state.last_alert = 0


# # ================= HELPERS =================
# def attention_score(conf, fatigue, label):
#     score = conf * 100 - fatigue * 0.7
#     if label == "Stressed":
#         score -= 10
#     if label == "Fatigued":
#         score -= 20
#     return max(0, int(score))


# # ================= START =================
# if not start:
#     st.info("▶ Toggle **Start Live Monitoring** to begin.")
#     st.stop()

# data = get_latest_data()
# if data is None:
#     st.warning("⏳ Waiting for live data from backend…")
#     st.stop()


# # ================= DATA =================
# label = data.get("label_name", "Unknown")
# confidence = float(data.get("confidence", 0))
# fatigue = int(data.get("features", {}).get("fatigue_score", 0))
# attention = attention_score(confidence, fatigue, label)

# ui_conf = smooth_value("ui_confidence", confidence * 100)
# ui_fat = smooth_value("ui_fatigue", fatigue)
# ui_att = smooth_value("ui_attention", attention)


# # ======================================================
# # ROW 1 — TOP VISUAL DASHBOARD
# # ======================================================
# v1, v2, v3 = st.columns([1.1, 1.8, 1.1])


# # 🧠 Brain Card
# with v1:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)

#         pulse_speed = max(1.2, 3 - (ui_att / 50))
#         brain_color = "#ff6b6b" if ui_fat > 70 else "#ffb347" if ui_fat > 40 else "#4cff9f"

#         st.markdown(f"""
#         <div class="brain-box"
#              style="
#              animation-duration:{pulse_speed}s;
#              background:radial-gradient(circle,{brain_color}55 0%,transparent 65%);
#              color:{brain_color};">
#             🧠
#         </div>

#         <div class="small-text">
#             {tip("Cognitive Load", "Overall mental effort estimated from fatigue signals")}
#             : <b>{int(ui_fat)}/100</b><br>
#             {tip("Attention", "Focus score derived from interaction and eye metrics")}
#             : <b>{int(ui_att)}/100</b>
#         </div>
#         """, unsafe_allow_html=True)

#         st.markdown("</div>", unsafe_allow_html=True)


# # 👁 Visual Preview Card
# with v2:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)
#         st.subheader("👁 Visual Preview")

#         cam = st.camera_input("Camera", label_visibility="collapsed")

#         eye_aspect = data["features"].get("eye_aspect_mean", 0)
#         blink_rate = data["features"].get("eye_blink_rate", 0)
#         state = "Focused 👀" if eye_aspect > 0.32 else "Drowsy 😴"

#         st.markdown(f"""
#         <div class="small-text">
#             <b>{state}</b><br>
#             {tip("Blink rate", "Higher blink rate may indicate fatigue")}
#             : {blink_rate}<br>
#             {tip("Eye aspect", "Eye openness ratio")}
#             : {eye_aspect:.2f}
#         </div>
#         """, unsafe_allow_html=True)

#         st.markdown("</div>", unsafe_allow_html=True)


# # ⌨ Input Heat Card
# with v3:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)
#         st.subheader("⌨ Input Heat")

#         key_rate = data["features"].get("key_rate", 0)
#         mouse_speed = data["features"].get("mouse_speed_mean", 0)

#         ui_key = smooth_value("ui_key", key_rate * 100)
#         ui_mouse = smooth_value("ui_mouse", mouse_speed / 15)

#         st.progress(min(100, int(ui_key)))
#         st.caption(f"Typing rate: {key_rate:.2f}")

#         st.progress(min(100, int(ui_mouse)))
#         st.caption(f"Mouse speed: {int(mouse_speed)}")

#         heat = int(min(100, (ui_key + ui_mouse) / 2))
#         st.markdown(f"<b>Heat Level:</b> {heat}%", unsafe_allow_html=True)

#         st.markdown("</div>", unsafe_allow_html=True)


# # ======================================================
# # ROW 2 — CORE ANALYTICS
# # ======================================================
# c1, c2, c3 = st.columns([1.1, 1.8, 1.1])


# # 🎯 Confidence
# with c1:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)
#         st.markdown(f"<h2>{ui_conf:.1f}%</h2>", unsafe_allow_html=True)
#         st.progress(int(ui_att))
#         st.caption(f"Attention: {int(ui_att)}/100")
#         st.markdown("</div>", unsafe_allow_html=True)


# # 📡 Cognitive Trend
# with c2:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)
#         st.subheader("📡 Cognitive Trend")

#         st.session_state.history.loc[len(st.session_state.history)] = [
#             pd.Timestamp.utcnow(), fatigue
#         ]
#         st.session_state.history = st.session_state.history.tail(120)

#         smooth_df = st.session_state.history.copy()
#         smooth_df["fatigue"] = smooth_df["fatigue"].rolling(5, min_periods=1).mean()

#         chart = (
#             alt.Chart(smooth_df)
#             .mark_line(interpolate="monotone", strokeWidth=3)
#             .encode(
#                 x="time:T",
#                 y="fatigue:Q",
#                 tooltip=["time:T", "fatigue:Q"]
#             )
#             .properties(height=260)
#         )

#         st.altair_chart(chart, use_container_width=True)
#         st.markdown("</div>", unsafe_allow_html=True)


# # ⚠ Risk
# with c3:
#     with st.container():
#         st.markdown("<div class='glass'>", unsafe_allow_html=True)
#         st.subheader("⚠ Cognitive Risk")
#         st.progress(int(ui_fat))
#         st.caption(f"{int(ui_fat)}/100")
#         st.markdown("</div>", unsafe_allow_html=True)


# # ================= ALERT =================
# if alert_mode and (label in ["Stressed", "Fatigued"] or fatigue > 70):
#     if time.time() - st.session_state.last_alert > 10:
#         st.toast("⚠️ Cognitive Alert!", icon="🚨")
#         st.session_state.last_alert = time.time()
