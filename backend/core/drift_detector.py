class OverfittingMonitor:
    def __init__(self):
        pass

    def check(self):
        pass
    
class DriftAlert:
    def __init__(self, model_id, current_avg, baseline, drop_percent, recommendation):
        self.model_id = model_id
        self.current_avg = current_avg
        self.baseline = baseline
        self.drop_percent = drop_percent
        self.recommendation = recommendation

class DriftDetector:
    def __init__(self):
        self.settings_drift_threshold = 0.15

    def get_baseline_confidence(self, model_id):
        return 0.85
        
    def check(self, model_id, recent_runs):
        if len(recent_runs) < 20:
            return None
            
        avg_confidence = sum([r.get('confidence', 0) for r in recent_runs[-20:]]) / 20.0
        baseline = self.get_baseline_confidence(model_id)
        
        if baseline == 0: return None
        
        drop_pct = (baseline - avg_confidence) / baseline

        if drop_pct > self.settings_drift_threshold:
            return DriftAlert(
                model_id=model_id,
                current_avg=avg_confidence,
                baseline=baseline,
                drop_percent=drop_pct * 100,
                recommendation="Record new videos and retrain"
            )
        return None
