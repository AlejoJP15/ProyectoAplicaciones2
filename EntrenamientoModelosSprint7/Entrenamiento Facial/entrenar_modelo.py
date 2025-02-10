import os
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# Configuración general
BASE_DIR = r'C:\Users\alejo\OneDrive\Documentos\PYTHON\ReconocimientoEmocional\data\processed_data\balanced_data'
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32  # Ajustado para CPU
EPOCHS = 50
LEARNING_RATE = 0.0001

# Generadores de datos con técnicas de Data Augmentation
datagen_train = ImageDataGenerator(
    rescale=1.0 / 255.0,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True
)

datagen_val = ImageDataGenerator(rescale=1.0 / 255.0)

# Generar lotes para entrenamiento
train_generator = datagen_train.flow_from_directory(
    os.path.join(BASE_DIR, 'train'),
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

val_generator = datagen_val.flow_from_directory(
    os.path.join(BASE_DIR, 'val'),
    target_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical'
)

# Modelo base con MobileNetV2 (transfer learning)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Congelar las capas del modelo base
for layer in base_model.layers:
    layer.trainable = False

# Añadir capas personalizadas
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.4)(x)  # Dropout para evitar sobreajuste
x = Dense(256, activation='relu')(x)  # Capa completamente conectada
x = Dropout(0.3)(x)  # Otro Dropout
output = Dense(train_generator.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)

# Compilar el modelo
model.compile(optimizer=Adam(learning_rate=LEARNING_RATE),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Callbacks para optimizar el entrenamiento
checkpoint = ModelCheckpoint('emotion_model_best_mobilenetv2_cpu.keras',
                             monitor='val_accuracy', save_best_only=True, verbose=1)
early_stopping = EarlyStopping(monitor='val_accuracy', patience=10, verbose=1, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, verbose=1, min_lr=1e-6)

# Entrenamiento inicial (capas congeladas)
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=[checkpoint, early_stopping, reduce_lr],
    verbose=1
)

# Descongelar las capas del modelo base para ajuste fino
for layer in base_model.layers:
    layer.trainable = True

# Compilar el modelo para el ajuste fino
model.compile(optimizer=Adam(learning_rate=1e-5),  # Aprendizaje más bajo para ajuste fino
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Entrenamiento adicional (fine-tuning)
history_fine_tuning = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=20,  # Ajuste fino con menos épocas
    callbacks=[checkpoint, early_stopping, reduce_lr],
    verbose=1
)

print("Entrenamiento completado. Modelo guardado como 'emotion_model_best_mobilenetv2_cpu.keras'.")
