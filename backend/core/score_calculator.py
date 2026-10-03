class ScoreCalculator:
    def __init__(self):
        pass

    def load_scoring_config(self, model_id):
        class Config:
            mode = "auto"
            layer1_enabled = True
            layer1_weight = 0.3
            layer2_enabled = True
            rewards = []
            penalties = []
            penalty_weight = 0.5
            layer3_enabled = True
        return Config()

    def auto_score(self, attempt_result):
        score = 0
        if attempt_result.get('completed_without_error'): score += 40
        if attempt_result.get('output_not_empty'): score += 30
        if attempt_result.get('duration', 999) < 60: score += 20
        if attempt_result.get('goal_match', 0) > 0.5: 
            score += attempt_result.get('goal_match') * 10
        return score

    def calculate(self, attempt_result, model_id):
        config = self.load_scoring_config(model_id)
        total = 0

        if config.mode == "auto":
            total = self.auto_score(attempt_result)
        elif config.mode == "manual":
            # Manual scoring logic
            total = 75

        return min(100, max(0, total))
