import tensorflow as tf

class Augmenter:
    def __init__(self):
        self.data_augmentation = tf.keras.Sequential([
            tf.keras.layers.RandomBrightness(factor=0.2),
            tf.keras.layers.RandomContrast(factor=0.15),
            tf.keras.layers.RandomZoom(height_factor=0.1, width_factor=0.1),
            tf.keras.layers.RandomFlip("horizontal"),
        ])

    def apply_augmentation(self, train_dataset):
        AUTOTUNE = tf.data.AUTOTUNE
        train_dataset = train_dataset.map(
            lambda x, y: (self.data_augmentation(x, training=True), y), 
            num_parallel_calls=AUTOTUNE
        )
        return train_dataset
