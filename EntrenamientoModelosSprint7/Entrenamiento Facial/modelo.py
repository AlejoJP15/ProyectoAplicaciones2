from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, Input # type: ignore

def construir_modelo(input_shape, num_classes):
    """
    Construye un modelo CNN mejorado para reconocimiento emocional.
    """
    model = Sequential([
        Input(shape=input_shape),
        
        # Primera capa convolucional
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.25),

        # Segunda capa convolucional
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.25),

        # Tercera capa convolucional
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Dropout(0.25),

        # Capa completamente conectada
        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.5),

        # Salida
        Dense(num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model
