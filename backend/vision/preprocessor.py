import tensorflow as tf

class Preprocessor:
    def __init__(self):
        self.target_size = [224, 224]

    def preprocess_for_model(self, image_array):
        tensor = tf.cast(image_array, tf.float32)
        tensor = tf.image.resize(tensor, self.target_size)
        tensor = tensor / 255.0
        tensor = tf.expand_dims(tensor, 0)
        return tensor

    def preprocess_batch(self, image_arrays):
        tensors = [tf.cast(img, tf.float32) for img in image_arrays]
        batch = tf.stack(tensors)
        batch = tf.image.resize(batch, self.target_size)
        batch = batch / 255.0
        return batch
