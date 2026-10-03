import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['DML_VISIBLE_DEVICES'] = '1'
import tensorflow as tf

print("=== GPU CHECK ===")
print(f"TensorFlow: {tf.__version__}")
gpus = tf.config.list_physical_devices('GPU')
print(f"GPUs found: {len(gpus)}")
for gpu in gpus:
    print(f"  {gpu}")
    tf.config.experimental.set_memory_growth(gpu, True)

if gpus:
    with tf.device('/GPU:0'):
        a = tf.random.normal([1000, 1000])
        b = tf.random.normal([1000, 1000])
        c = tf.matmul(a, b)
    print(f"Matrix multiply on GPU: OK, result shape {c.shape}")
    print("GPU TRAINING IS READY")
else:
    print("NO GPU FOUND — check CUDA installation")
