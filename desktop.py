import sys
import subprocess
import os
from PyQt6.QtCore import QUrl, QTimer
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QLabel
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtGui import QIcon
import threading



class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ModelFactory AI Agent Platform")
        self.setGeometry(100, 100, 1400, 900)
        self.setStyleSheet("background-color: #05080b;")
        
        self.browser = QWebEngineView()
        
        # We attempt to load the Vite dev server at 3000
        # If the user built it, we could load from a static python server
        self.browser.setUrl(QUrl("http://localhost:3000"))
        
        self.setCentralWidget(self.browser)
        
        # API server is started externally by start.bat

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
