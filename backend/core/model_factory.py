import tensorflow as tf
from tensorflow.keras import mixed_precision

# Enable mixed precision for RTX cards
mixed_precision.set_global_policy('mixed_float16')

class ModelFactory:
    def __init__(self):
        pass

    def create_model(self, num_classes=2):
        with tf.device('/GPU:0'):
            base_model = tf.keras.applications.MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights='imagenet'
            )
            base_model.trainable = False
            
            inputs = tf.keras.Input(shape=(224, 224, 3))
            x = base_model(inputs, training=False)
            x = tf.keras.layers.GlobalAveragePooling2D()(x)
            x = tf.keras.layers.Dense(256, activation='relu')(x)
            x = tf.keras.layers.Dropout(0.3)(x)
            
            # Note: output layer must use float32 for stability in mixed precision
            outputs = tf.keras.layers.Dense(num_classes, activation='softmax', dtype='float32')(x)
            model = tf.keras.Model(inputs, outputs)

        optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
        # Wrap optimizer with LossScaleOptimizer for mixed precision
        optimizer = mixed_precision.LossScaleOptimizer(optimizer)

        model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model

factory = ModelFactory()
