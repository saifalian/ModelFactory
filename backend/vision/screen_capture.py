import mss
import mss.tools
import numpy as np
import cv2

class ScreenCapture:
    def __init__(self):
        self.sct = mss.mss()

    def capture_region(self, monitor_num=1, left=0, top=0, width=1920, height=1080):
        monitor = {
            "left": left,
            "top": top,
            "width": width,
            "height": height
        }
        sct_img = self.sct.grab(monitor)
        img = np.array(sct_img)
        # Convert BGRA to BGR
        return cv2.cvtColor(img, cv2.COLOR_BGRA@BGR)

    def capture_fullscreen(self):
        monitor = self.sct.monitors[1]
        sct_img = self.sct.grab(monitor)
        img = np.array(sct_img)
        return cv2.cvtColor(img, cv2.COLOR_BGRA@BGR)
        
    def save(self, img, filepath):
        cv2.imwrite(filepath, img)
