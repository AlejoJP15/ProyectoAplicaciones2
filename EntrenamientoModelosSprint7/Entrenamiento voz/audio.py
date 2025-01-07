import sounddevice as sd
import librosa
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import keyboard  # Para detectar teclas

# Configuración del micrófono
SAMPLE_RATE = 22050  # Frecuencia de muestreo

# Cargar el modelo y el codificador de etiquetas
model = load_model("emotion_recognition_lstm.h5")
label_encoder = LabelEncoder()
label_encoder.classes_ = np.load("label_classes.npy", allow_pickle=True)

# Función para capturar audio en tiempo real
def capture_audio(sample_rate=SAMPLE_RATE):
    print("Presiona 'espacio' para comenzar la grabación y 'espacio' nuevamente para detenerla.")
    while True:
        # Esperar hasta que el usuario presione "espacio" para iniciar
        if keyboard.is_pressed("space"):
            print("Grabando...")
            audio = []
            stream = sd.InputStream(samplerate=sample_rate, channels=1, dtype="float32", callback=lambda indata, frames, time, status: audio.append(indata.copy()))
            stream.start()

            # Esperar hasta que el usuario presione "espacio" para detener
            while not keyboard.is_pressed("space"):
                pass

            stream.stop()
            print("Grabación finalizada")

            # Validar si se capturó audio
            if len(audio) == 0:
                print("Error: No se capturó ningún audio. Verifica el micrófono.")
                return None

            return np.concatenate(audio).flatten()

# Función para predecir emoción
def predict_emotion(audio, model, sample_rate=SAMPLE_RATE, n_mfcc=40):
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=n_mfcc)
    padded_mfccs = np.pad(mfccs, ((0, max(0, 100 - mfccs.shape[1])), (0, 0)), mode='constant')
    features = padded_mfccs.T[:100].reshape(1, 100, n_mfcc)
    prediction = model.predict(features)
    emotion = label_encoder.inverse_transform([np.argmax(prediction)])
    return emotion[0]

# Ciclo principal para reconocimiento en tiempo real
if __name__ == "__main__":
    while True:
        # Capturar audio al presionar teclas
        audio = capture_audio()
        if audio is None:
            print("Intentemos grabar de nuevo.")
            continue

        # Predecir emoción
        emotion = predict_emotion(audio, model) 
        print(f"Emoción detectada:{emotion}")
        cont = input("¿Quieres continuar? (s/n): ")
        if cont.lower() != "s":                                                          
            break

