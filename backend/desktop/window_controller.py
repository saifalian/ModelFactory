import win32gui
import win32con

class WindowController:
    def __init__(self, window_title="Coinglass"):
        self.window_title = window_title

    def find_window(self):
        hwnd = win32gui.FindWindow(None, self.window_title)
        return hwnd

    def focus_window(self):
        hwnd = self.find_window()
        if hwnd:
            win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
            win32gui.SetForegroundWindow(hwnd)
            return True
        return False

    def is_focused(self):
        hwnd = self.find_window()
        fg = win32gui.GetForegroundWindow()
        return hwnd != 0 and hwnd == fg

    def get_window_rect(self):
        hwnd = self.find_window()
        if hwnd:
            return win32gui.GetWindowRect(hwnd)
        return None
