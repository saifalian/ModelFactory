from pynput import mouse, keyboard
import time

class Recorder:
    def __init__(self):
        self.events = []
        self.recording = False
        self.mouse_listener = None
        self.keyboard_listener = None
        self.start_time = 0
        
    def start(self):
        self.events = []
        self.recording = True
        self.start_time = time.time()
        
        self.mouse_listener = mouse.Listener(
            on_click=self.on_click,
            on_scroll=self.on_scroll)
            
        self.keyboard_listener = keyboard.Listener(
            on_press=self.on_press)
            
        self.mouse_listener.start()
        self.keyboard_listener.start()

    def stop(self):
        self.recording = False
        if self.mouse_listener:
            self.mouse_listener.stop()
        if self.keyboard_listener:
            self.keyboard_listener.stop()
        return self.events

    def on_click(self, x, y, button, pressed):
        if pressed and self.recording:
            btn = 'left' if button == mouse.Button.left else 'right'
            self.events.append({
                "type": "click" if btn == 'left' else "right_click",
                "x": int(x), "y": int(y),
                "time": time.time() - self.start_time
            })

    def on_scroll(self, x, y, dx, dy):
        if self.recording:
            self.events.append({
                "type": "scroll",
                "amount": int(dy * 10),
                "time": time.time() - self.start_time
            })

    def on_press(self, key):
        if self.recording:
            try:
                k = key.char
            except AttributeError:
                k = key.name
            
            self.events.append({
                "type": "key",
                "key": k,
                "time": time.time() - self.start_time
            })
