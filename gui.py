import sys
import os
import time
import requests
import subprocess
import threading
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QPushButton, QFrame, 
                             QStackedWidget, QPlainTextEdit, QTabWidget,
                             QGridLayout, QScrollArea)
from PyQt6.QtCore import Qt, QSize, QTimer, QThread, pyqtSignal
from PyQt6.QtGui import QFont, QColor, QPalette

# --- THEME COLORS (From Design System) ---
C_BG0 = "#05080b"   
C_BG1 = "#090d12"   
C_BG2 = "#0e1419"   
C_BG3 = "#141c24"   
C_BORDER = "#1a2535"
C_BORDER_B = "#243040"
C_AMBER = "#f59e0b"
C_AMBER_D = "#b45309"
C_GREEN = "#10b981"
C_RED = "#ef4444"
C_BLUE = "#3b82f6"
C_CYAN = "#06b6d4"
C_PURPLE = "#8b5cf6"
C_TEXT = "#94a3b8"
C_TEXT_B = "#cbd5e1"
C_TEXT_D = "#475569"
C_WHITE = "#f1f5f9"

FONT_MAIN = "Courier New"
API_URL = "http://localhost:8000/api"

class SidebarButton(QPushButton):
    def __init__(self, text, icon="", active=False):
        super().__init__()
        self.setText(f" {icon} {text}")
        self.setCheckable(True)
        self.setAutoExclusive(True)
        self.setChecked(active)
        self.setFixedHeight(45)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFont(QFont(FONT_MAIN, 10))
        self.update_style()
        self.toggled.connect(self.update_style)

    def update_style(self):
        active = self.isChecked()
        self.setStyleSheet(f"""
            QPushButton {{
                background-color: {"#1c2128" if active else "transparent"};
                color: {"#f59e0b" if active else "#94a3b8"};
                border: none;
                text-align: left;
                padding-left: 15px;
                border-left: {"3px solid #f59e0b" if active else "none"};
            }}
            QPushButton:hover {{
                background-color: #1c2128;
                color: white;
            }}
        """)

class StatusCard(QFrame):
    def __init__(self, name, status, perf, attempts):
        super().__init__()
        self.setFixedSize(280, 130)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {C_BG3};
                border: 1px solid {C_BORDER};
                border-radius: 4px;
            }}
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(15, 12, 15, 12)
        layout.setSpacing(6)
        
        header = QHBoxLayout()
        self.dot = QLabel("●")
        self.dot.setStyleSheet(f"color: {C_GREEN if status == 'Confident' else C_AMBER}; font-size: 16px; border: none;")
        self.name_lbl = QLabel(name)
        self.name_lbl.setStyleSheet(f"color: {C_WHITE}; font-weight: bold; font-size: 13px; border: none;")
        header.addWidget(self.dot)
        header.addWidget(self.name_lbl)
        header.addStretch()
        layout.addLayout(header)
        
        self.status_v = QLabel(status)
        self.status_v.setStyleSheet(f"color: {C_TEXT_D}; font-size: 10px; border: none;")
        layout.addWidget(self.status_v)

        layout.addSpacing(5)

        # Performance
        row1 = QHBoxLayout()
        l1 = QLabel("Performance:")
        l1.setStyleSheet(f"color: {C_TEXT_D}; font-size: 10px; border: none;")
        self.perf_v = QLabel(f"{perf}%")
        self.perf_v.setStyleSheet(f"color: {C_WHITE}; font-weight: bold; font-size: 10px; border: none;")
        row1.addWidget(l1)
        row1.addWidget(self.perf_v)
        row1.addStretch()
        layout.addLayout(row1)

        # Attempt
        row2 = QHBoxLayout()
        l2 = QLabel("Attempt:")
        l2.setStyleSheet(f"color: {C_TEXT_D}; font-size: 10px; border: none;")
        self.att_v = QLabel(attempts)
        self.att_v.setStyleSheet(f"color: {C_TEXT_D}; font-size: 10px; border: none;")
        row2.addWidget(l2)
        row2.addWidget(self.att_v)
        row2.addStretch()
        layout.addLayout(row2)

    def update_values(self, status, perf, att):
        self.status_v.setText(status)
        self.perf_v.setText(f"{perf}%")
        self.att_v.setText(att)
        self.dot.setStyleSheet(f"color: {C_GREEN if status == 'Confident' else C_AMBER}; font-size: 16px; border: none;")

class UpdateWorker(QThread):
    status_updated = pyqtSignal(dict)
    log_updated = pyqtSignal(str)

    def run(self):
        while True:
            try:
                for mid in ["click_clusters", "read_popup", "assess_chart"]:
                    try:
                        r = requests.get(f"{API_URL}/models/{mid}/train/status", timeout=0.5)
                        if r.status_code == 200:
                            data = r.json()
                            data["id"] = mid
                            self.status_updated.emit(data)
                    except: pass
                
                try:
                    r = requests.get(f"{API_URL}/models/global/train/log", timeout=0.5)
                    if r.status_code == 200:
                        logs = r.json().get("logs", [])
                        if logs:
                            self.log_updated.emit("\n".join(logs))
                except: pass
            except: pass
            time.sleep(2)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Liquidity Heatmap Agent")
        self.resize(1200, 850)
        self.setStyleSheet(f"background-color: {C_BG0}; color: {C_TEXT};")
        self.setFont(QFont(FONT_MAIN))
        
        self.launch_backend()
        
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QHBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        self.setup_sidebar()
        
        self.content_stack = QStackedWidget()
        self.main_layout.addWidget(self.content_stack)
        
        self.setup_dashboard_view()
        self.setup_placeholders()
        
        self.worker = UpdateWorker()
        self.worker.status_updated.connect(self.handle_status_update)
        self.worker.log_updated.connect(self.handle_log_update)
        self.worker.start()

    def launch_backend(self):
        python_exe = os.path.join("backend", "venv", "Scripts", "python.exe")
        backend_script = os.path.join("backend", "main.py")
        if os.path.exists(python_exe) and os.path.exists(backend_script):
            self.backend_proc = subprocess.Popen(
                [python_exe, backend_script],
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )

    def setup_sidebar(self):
        sidebar = QFrame()
        sidebar.setFixedWidth(240)
        sidebar.setStyleSheet(f"background-color: {C_BG1}; border-right: 1px solid {C_BORDER};")
        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(0, 20, 0, 20)
        
        logo = QLabel("◈ ModelFactory")
        logo.setStyleSheet(f"color: {C_WHITE}; font-size: 18px; font-weight: bold; padding-left: 20px; margin-bottom: 20px;")
        layout.addWidget(logo)
        
        self.btn_dash = SidebarButton("Dashboard", "⬡", True)
        self.btn_control = SidebarButton("Agent Control", "⚡")
        self.btn_video = SidebarButton("Video Processing", "🎬")
        self.btn_results = SidebarButton("Results", "📊")
        self.btn_settings = SidebarButton("Settings", "⚙")
        
        for i, btn in enumerate([self.btn_dash, self.btn_control, self.btn_video, self.btn_results, self.btn_settings]):
            btn.clicked.connect(lambda _, x=i: self.content_stack.setCurrentIndex(x))
            layout.addWidget(btn)
        
        layout.addStretch()
        layout.addWidget(QLabel("v1.0.0", styleSheet=f"color: {C_TEXT_D}; padding-left: 20px;"))
        self.main_layout.addWidget(sidebar)

    def handle_status_update(self, data):
        mid = data.get("id")
        if mid in self.cards:
            status = data.get("status", "Unknown").capitalize()
            perf = data.get("score", 0)
            iteration = data.get("iteration", 0)
            self.cards[mid].update_values(status, int(perf), f"{iteration} / ∞")

    def handle_log_update(self, msg):
        self.terminal.appendPlainText(msg)
        self.terminal.verticalScrollBar().setValue(self.terminal.verticalScrollBar().maximum())

    def start_train(self, hw):
        try:
            requests.post(f"{API_URL}/models/global/train/start?hw={hw}", timeout=1)
            self.terminal.appendPlainText(f"[SYSTEM] Begin Training session started on {hw.upper()}")
        except Exception as e:
            self.terminal.appendPlainText(f"[ERROR] Failed to start training: {e}")

    def setup_dashboard_view(self):
        view = QWidget()
        layout = QVBoxLayout(view)
        layout.setContentsMargins(30, 30, 30, 30)
        
        # Header Row
        h_row = QHBoxLayout()
        header = QVBoxLayout()
        title = QLabel("🤖 Unsupervised Learning Dashboard")
        title.setStyleSheet(f"color: {C_WHITE}; font-size: 20px; font-weight: bold;")
        subtitle = QLabel("Monitor and manage your autonomous, unsupervised model training loops.")
        subtitle.setStyleSheet(f"color: {C_TEXT}; font-size: 11px;")
        header.addWidget(title)
        header.addWidget(subtitle)
        h_row.addLayout(header)
        h_row.addStretch()
        
        save_btn = QPushButton("💾 Save Configs")
        save_btn.setFixedSize(140, 38)
        save_btn.setStyleSheet(f"background-color: {C_GREEN}; color: white; border-radius: 4px; font-weight: bold;")
        h_row.addWidget(save_btn, alignment=Qt.AlignmentFlag.AlignTop)
        layout.addLayout(h_row)
        layout.addSpacing(25)
        
        # Tabs
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet(f"""
            QTabWidget::pane {{ border: none; }}
            QTabBar::tab {{ background: {C_BG3}; color: {C_TEXT}; padding: 10px 20px; border: 1px solid {C_BORDER}; border-bottom: none; margin-right: 2px; }}
            QTabBar::tab:selected {{ background: {C_BG2}; color: {C_AMBER}; border-bottom: 2px solid {C_AMBER}; font-weight: bold; }}
        """)
        
        mon_tab = QWidget()
        mon_layout = QVBoxLayout(mon_tab)
        mon_layout.setContentsMargins(0, 20, 0, 0)
        
        # Cards
        cards_h = QHBoxLayout()
        self.cards = {
            "click_clusters": StatusCard("click_clusters", "Confident", 84, "142 / ∞"),
            "read_popup": StatusCard("read_popup", "Confident", 91, "89 / ∞"),
            "assess_chart": StatusCard("assess_chart", "Training", 61, "12 / ∞")
        }
        for c in self.cards.values(): cards_h.addWidget(c)
        cards_h.addStretch()
        mon_layout.addLayout(cards_h)
        mon_layout.addSpacing(30)
        
        # Action Area
        act_h = QHBoxLayout()
        self.train_cpu = QPushButton("🧠 Train (CPU)")
        self.train_gpu = QPushButton("🚀 Train (GPU)")
        self.stop_all = QPushButton("■ Stop All")
        
        for btn, color in [(self.train_cpu, C_AMBER), (self.train_gpu, C_PURPLE), (self.stop_all, C_BORDER_B)]:
            btn.setFixedSize(160, 42)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setStyleSheet(f"background-color: {color}; color: white; border-radius: 4px; font-weight: bold; font-size: 13px;")
            act_h.addWidget(btn)
        
        self.train_cpu.clicked.connect(lambda: self.start_train('cpu'))
        self.train_gpu.clicked.connect(lambda: self.start_train('gpu'))
        self.stop_all.clicked.connect(lambda: requests.post(f"{API_URL}/models/global/train/stop"))
        
        act_h.addStretch()
        mon_layout.addLayout(act_h)
        mon_layout.addSpacing(20)
        
        # Terminal
        mon_layout.addWidget(QLabel("Terminal — Live Logs", styleSheet=f"color: {C_WHITE}; font-weight: bold;"))
        self.terminal = QPlainTextEdit()
        self.terminal.setReadOnly(True)
        self.terminal.setStyleSheet(f"background-color: {C_BG0}; color: {C_GREEN}; border: 1px solid {C_BORDER}; padding: 10px; font-family: '{FONT_MAIN}';")
        mon_layout.addWidget(self.terminal)

        self.tabs.addTab(mon_tab, "Monitor")
        self.tabs.addTab(self.create_reset_tab(), "Reset Rules")
        self.tabs.addTab(QWidget(), "Scoring Config")
        self.tabs.addTab(QWidget(), "Data Checkpoints")
        
        layout.addWidget(self.tabs)
        self.content_stack.addWidget(view)

    def create_reset_tab(self):
        tab = QWidget()
        l = QVBoxLayout(tab)
        l.setContentsMargins(0, 20, 0, 0)
        banner = QLabel("ℹ THE RESET SYSTEM: Before every training attempt the app must be in a known clean state.\nThree layers work together: Master Reset, Verify, and Confirm.")
        banner.setWordWrap(True)
        banner.setStyleSheet(f"background-color: {C_AMBER}20; color: {C_AMBER}; border: 1px solid {C_AMBER}40; padding: 12px; border-radius: 2px; font-size: 10px;")
        l.addWidget(banner)
        l.addSpacing(15)
        sec = QFrame()
        sec.setStyleSheet(f"background-color: {C_BG3}; border: 1px solid {C_CYAN}40; border-radius: 4px;")
        sl = QVBoxLayout(sec)
        sl.addWidget(QLabel("MASTER RESET - Layer 1", styleSheet=f"color: {C_CYAN}; font-weight: bold; font-size: 12px;"))
        sl.addWidget(QLabel("Replays recorded steps to force app back to a known state.", styleSheet=f"color: {C_TEXT}; font-size: 10px;"))
        test_btn = QPushButton("▶ Test Master Reset Now")
        test_btn.setFixedSize(180, 30)
        test_btn.setStyleSheet(f"background-color: {C_CYAN}; color: white; border-radius: 4px; font-size: 10px;")
        sl.addWidget(test_btn)
        l.addWidget(sec)
        l.addStretch()
        return tab

    def setup_placeholders(self):
        for name in ["Agent Control", "Video Processing", "Results", "Settings"]:
            view = QWidget()
            l = QVBoxLayout(view)
            l.addStretch()
            lbl = QLabel(f"◈ {name} Module")
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lbl.setStyleSheet(f"color: {C_TEXT_D}; font-size: 24px; font-weight: bold;")
            l.addWidget(lbl)
            l.addStretch()
            self.content_stack.addWidget(view)

    def closeEvent(self, event):
        if hasattr(self, 'backend_proc'):
            if os.name == 'nt':
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(self.backend_proc.pid)], 
                                creationflags=subprocess.CREATE_NO_WINDOW)
            else:
                self.backend_proc.terminate()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
