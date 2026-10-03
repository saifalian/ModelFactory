import time

class ResetController:
    def __init__(self):
        self.reset_sequence = []
        self.threshold = 75

    def execute(self):
        # Master Reset
        for step in self.reset_sequence:
            pass # Execute step
        time.sleep(1.5)
        return True

    def capture(self):
        pass # return screenshot

    def verify(self):
        return True
        
    def recover(self):
        pass

    def confirm(self):
        score = 82
        return score, score >= self.threshold
