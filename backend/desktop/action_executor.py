import pyautogui
import time

class ActionExecutor:
    def __init__(self):
        pyautogui.FAILSAFE = False
        pyautogui.PAUSE = 0.05

    def run(self, step):
        action_type = step.get("type")
        
        if action_type == "click":
            x, y = step.get("x"), step.get("y")
            pyautogui.click(x, y)
            
        elif action_type == "double_click":
            x, y = step.get("x"), step.get("y")
            pyautogui.doubleClick(x, y)
            
        elif action_type == "key":
            key = step.get("key")
            keys = key.split('+')
            if len(keys) > 1:
                pyautogui.hotkey(*[k.strip().lower() for k in keys])
            else:
                pyautogui.press(key.lower())
                
        elif action_type == "wait":
            seconds = float(step.get("seconds", 1.0))
            time.sleep(seconds)
            
        elif action_type == "scroll":
            amount = int(step.get("amount", 0))
            pyautogui.scroll(amount)
            
        elif action_type == "type":
            text = step.get("text", "")
            pyautogui.write(text, interval=0.05)
