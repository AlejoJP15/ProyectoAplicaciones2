import os
import librosa
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical

# Diccionario para mapear emociones
emotion_map = {
    "01": "neutral", "02": "calm", "03": "happy", "04": "sad",
    "05": "angry", "06": "fearful", "07": "disgust", "08": "surprised"
}

# Función para extraer etiquetas
def extract_labels(file_name):
    parts = file_name.split("-")
    return emotion_map[parts[2]]

# Función para extraer MFCCs como secuencias
def extract_features(file_path, n_mfcc=40):
    audio, sr = librosa.load(file_path, sr=22050)
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    return mfccs.T

# Cargar datos y etiquetas
def load_data(dataset_path, max_pad_length=100):
    data = []
    labels = []
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith(".wav"):
                file_path = os.path.join(root, file)
                label = extract_labels(file)
                features = extract_features(file_path)
                padded_features = np.pad(features, ((0, max(0, max_pad_length - features.shape[0])), (0, 0)), mode='constant')
                data.append(padded_features[:max_pad_length])
                labels.append(label)
    return np.array(data), np.array(labels)

# Ruta al dataset
dataset_path = "Voz"  
print("Cargando datos...")
X, y = load_data(dataset_path)
print("Datos cargados.")

# Codificar etiquetas
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_categorical = to_categorical(y_encoded)

# Guardar las clases del LabelEncoder
np.save("label_classes.npy", label_encoder.classes_)

# Dividir en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y_categorical, test_size=0.2, random_state=42)

# Crear el modelo LSTM
model = Sequential([
    LSTM(128, input_shape=(X_train.shape[1], X_train.shape[2]), return_sequences=True),
    Dropout(0.3),
    LSTM(64, return_sequences=False),
    Dropout(0.3),
    Dense(64, activation="relu"),
    Dropout(0.3),
    Dense(y_categorical.shape[1], activation="softmax")
])

# Compilar el modelo
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# Entrenar el modelo
print("Entrenando el modelo...")
history = model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.2)

# Evaluar el modelo
print("Evaluando el modelo...")
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Precisión: {accuracy:.2f}")

# Guardar el modelo
model.save("emotion_recognition_lstm.h5")
