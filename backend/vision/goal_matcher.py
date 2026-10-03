import cv2
from skimage.metrics import structural_similarity as ssim

class GoalMatcher:
    def __init__(self):
        self.threshold = 75

    def score(self, current_img, goal_img_path):
        goal_img = cv2.imread(goal_img_path)
        if goal_img is None or current_img is None:
            return 0
            
        # Resize to match
        goal_resized = cv2.resize(goal_img, (current_img.shape[1], current_img.shape[0]))
        
        # Convert to grayscale
        grayA = cv2.cvtColor(current_img, cv2.COLOR_BGR2GRAY)
        grayB = cv2.cvtColor(goal_resized, cv2.COLOR_BGR2GRAY)
        
        score, _ = ssim(grayA, grayB, full=True)
        return score * 100
        
    def similarity(self, current_img):
        # Mock implementation returning a fixed score for now
        return 85
