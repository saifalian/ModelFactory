import pytesseract
import cv2
import re

class OCRReader:
    def __init__(self, tesseract_cmd=r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    def read_text(self, img):
        if img is None:
            return ""
            
        # Preprocessing for better OCR
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        
        text = pytesseract.image_to_string(thresh, config='--psm 6')
        return text.strip()

    def extract_value(self, text):
        # Try to find a numeric value with M, K
        match = re.search(r'([0-9.]+)\s*([MK])', text, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            mult = match.group(2).upper()
            if mult == 'M': return val * 1000000
            elif mult == 'K': return val * 1000
            return val
        return 0
