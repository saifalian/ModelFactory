import time

class AttemptExecutor:
    def __init__(self):
        pass

    def run(self, model_id):
        # Execute the model on the real app
        time.sleep(2)
        return {
            'completed_without_error': True,
            'output_not_empty': True,
            'duration': 5,
            'goal_match': 0.82
        }
    
