import ctypes
import os
import sys

# Try to import tensorflow first to get its DLLs in the search path
print("Importing tensorflow...")
try:
    import tensorflow as tf
    print(f"TF Version: {tf.__version__}")
except Exception as e:
    print(f"TF Import failed: {e}")

path = r'D:\model factory\backend\venv\Lib\site-packages\tensorflow-plugins\tfdml_plugin.dll'
print(f"\nChecking plugin at: {path}")
print(f"File exists: {os.path.exists(path)}")

# Add directories to DLL search path
if sys.platform == 'win32' and hasattr(os, 'add_dll_directory'):
    plugin_dir = os.path.dirname(path)
    print(f"Adding DLL directory: {plugin_dir}")
    os.add_dll_directory(plugin_dir)
    
    dml_dir = os.path.join(plugin_dir, "directml")
    if os.path.exists(dml_dir):
        print(f"Adding DLL directory: {dml_dir}")
        os.add_dll_directory(dml_dir)

print("\nAttempting to load plugin DLL manually...")
try:
    # Use WinDLL for Windows
    lib = ctypes.WinDLL(path)
    print("SUCCESS: Successfully loaded tfdml_plugin.dll")
except Exception as e:
    print(f"FAILED: Could not load plugin DLL: {e}")
    
    # Try to load DirectML.dll first
    dml_path = os.path.join(os.path.dirname(path), "DirectML.dll")
    print(f"\nChecking DirectML.dll at: {dml_path}")
    if os.path.exists(dml_path):
        try:
            dml_lib = ctypes.WinDLL(dml_path)
            print("Successfully loaded DirectML.dll manually")
            
            # Now try the plugin again
            lib = ctypes.WinDLL(path)
            print("SUCCESS: Loaded tfdml_plugin.dll after loading DirectML.dll")
        except Exception as e2:
            print(f"Failed to load DirectML.dll: {e2}")

print("\nFinal DirectML device check via TF:")
try:
    print(f"Devices found: {tf.config.list_physical_devices()}")
    print(f"GPU found: {tf.config.list_physical_devices('GPU')}")
except NameError:
    print("TF not available for final check")
except Exception as e:
    print(f"Final check failed: {e}")
