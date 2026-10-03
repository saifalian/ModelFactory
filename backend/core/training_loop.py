import time
import subprocess
import tensorflow as tf
from .reset_controller import ResetController
from .score_calculator import ScoreCalculator
from .attempt_executor import AttemptExecutor
from .overfitting_monitor import OverfittingMonitor
import threading

def get_gpu_stats():
    try:
        import subprocess
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=memory.used,memory.total,utilization.gpu,temperature.gpu',
             '--format=csv,noheader,nounits'],
            capture_output=True, text=True
        )
        parts = result.stdout.strip().split(', ')
        return {
            'memory_used_mb': int(parts[0]),
            'memory_total_mb': int(parts[1]),
            'utilization_pct': int(parts[2]),
            'temperature_c': int(parts[3])
        }
    except:
        return {'memory_used_mb': 0, 'memory_total_mb': 4096, 'utilization_pct': 0, 'temperature_c': 0}

class TrainerState:
    def __init__(self, config):
        self.iteration = 0
        self.best_score = 0
        self.score_history = []
        self.log = []
        self.config = config
        self.model = None
        self.best_model = None
        self.gpu_stats = {}

class SelfImprovingTrainer(threading.Thread):
    def __init__(self, model_id, config):
        super().__init__()
        self.model_id = model_id
        self.state = TrainerState(config)
        self.reset_controller = ResetController()
        self.score_calculator = ScoreCalculator()
        self.attempt_executor = AttemptExecutor()
        self.overfitting_monitor = OverfittingMonitor()
        self.running = True
        self.paused = False

    def emit_log(self, msg):
        time_str = time.strftime("[%H:%M:%S]")
        self.state.log.append(f"{time_str} {self.model_id} {msg}")

    def emit_status(self, iteration, score, best_score):
        self.state.iteration = iteration
        self.state.score_history.append(score)
        self.state.best_score = best_score
        
    def pause_and_alert(self, msg=""):
        self.emit_log(f"Paused: {msg}")
        self.paused = True

    def stop_condition_met(self):
        if not self.running: return True
        return False

    def train_model(self, train_dataset, val_dataset, epochs=10, callbacks=None):
        # GPU optimized training call
        history = self.state.model.fit(
            train_dataset,
            epochs=epochs,
            validation_data=val_dataset,
            callbacks=callbacks,
            workers=4,
            use_multiprocessing=False
        )
        return history

    def run(self):
        self.emit_log("Starting GPU training session")
        
        while not self.stop_condition_met():
            if self.paused:
                time.sleep(1)
                continue
                
            self.state.iteration += 1

            # Monitor GPU stats every 10 iterations
            if self.state.iteration % 10 == 0:
                self.state.gpu_stats = get_gpu_stats()
                self.emit_log(f"GPU Stats: {self.state.gpu_stats['utilization_pct']}% util, {self.state.gpu_stats['temperature_c']}°C")

            self.emit_log("Master Reset running")
            reset_ok = self.reset_controller.execute()
            if not reset_ok:
                self.pause_and_alert("Master Reset failed")
                continue

            self.emit_log("Model attempting task...")
            result = self.attempt_executor.run(self.model_id)
            score = self.score_calculator.calculate(result, self.model_id)

            if score > self.state.best_score:
                self.state.best_score = score
                self.emit_log(f"New best score: {score}")

            if self.state.iteration % 10 == 0:
                self.overfitting_monitor.check()

            self.emit_status(self.state.iteration, score, self.state.best_score)
            time.sleep(1)
