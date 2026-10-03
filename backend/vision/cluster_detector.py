import cv2
import numpy as np

class ClusterDetector:
    def __init__(self):
        pass

    def detect_clusters(self, img):
        if img is None:
            return []
            
        # Convert to HSV for color filtering (reds/purples)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define range for red/purple liquidity zones
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)
        
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        
        mask = mask1 + mask2
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        clusters = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 50:  # Minimum size
                x, y, w, h = cv2.boundingRect(cnt)
                cx = x + w // 2
                cy = y + h // 2
                clusters.append({"x": cx, "y": cy, "area": area, "confidence": min(1.0, area / 1000.0)})
                
        # Sort by area
        clusters.sort(key=lambda c: c["area"], reverse=True)
        return clusters
