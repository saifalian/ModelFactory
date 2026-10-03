import json
import tensorflow as tf
from datetime import datetime
import os

class CheckpointManager:
    def save(self, reason, trainer_state):
        checkpoint = {
            "attempt": trainer_state.iteration,
            "best_score": trainer_state.best_score,
            "score_history": trainer_state.score_history,
            "training_log": trainer_state.log,
            "stop_reason": reason,
            "timestamp": datetime.now().isoformat(),
            "settings": trainer_state.config,
        }
        
        os.makedirs("checkpoints", exist_ok=True)
        path = f"checkpoints/checkpoint_{reason}_{trainer_state.iteration}.json"
        with open(path, "w") as f:
            json.dump(checkpoint, f)
            
        if trainer_state.model:
            model_path = f"checkpoints/model_{trainer_state.iteration}"
            trainer_state.model.save(model_path, save_format='tf')
        
        if trainer_state.best_model:
            best_path = "best/weights_best"
            os.makedirs("best", exist_ok=True)
            trainer_state.best_model.save(best_path, save_format='tf')

    def load(self, checkpoint_path):
        with open(checkpoint_path, "r") as f:
            state = json.load(f)
            
        model = None
        # Assuming model is stored in a directory with the same name as the json but without .json
        model_dir = checkpoint_path.replace("checkpoint_", "model_").replace(".json", "")
        if os.path.exists(model_dir):
            model = tf.keras.models.load_model(model_dir)
            
        return state, model
