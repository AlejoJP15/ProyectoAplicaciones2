import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Configuración general
IMAGE_SIZE = (224, 224)  # Tamaño de las imágenes para el modelo
MODEL_PATH = './modelos/emotion_model_best_mobilenetv2_cpu.keras'  # Ruta del modelo entrenado
CLASS_LABELS = ['anger', 'happy', 'neutral', 'sad', 'surprise']  # Etiquetas de las emociones

# Cargar el modelo
model = load_model(MODEL_PATH)

# Función para preprocesar las imágenes
def preprocess_image(image):
    image = cv2.resize(image, IMAGE_SIZE)  # Redimensionar la imagen
    image = img_to_array(image)  # Convertir a array
    image = np.expand_dims(image, axis=0)  # Añadir dimensión para batch
    image = image / 255.0  # Normalizar
    return image

# Función para detectar emoción en una imagen
def detect_emotion_in_image(image):
    preprocessed_image = preprocess_image(image)
    predictions = model.predict(preprocessed_image)
    emotion_index = np.argmax(predictions)
    emotion = CLASS_LABELS[emotion_index]
    confidence = predictions[0][emotion_index]
    return emotion, confidence

# Función para detección en tiempo real con la cámara
def detect_emotion_from_camera():
    cap = cv2.VideoCapture(0)  # Capturar video desde la cámara

    if not cap.isOpened():
        print("Error al abrir la cámara.")
        return

    print("Presiona 'q' para salir.")

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error al capturar el frame.")
            break

        # Convertir a escala de grises para detección de rostros
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detectar rostros en el frame
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            face = rgb_frame[y:y+h, x:x+w]
            emotion, confidence = detect_emotion_in_image(face)

            # Dibujar un rectángulo alrededor del rostro y mostrar la emoción
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            label = f"{emotion} ({confidence * 100:.2f}%)"
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # Mostrar en consola la emoción detectada
            print(f"Rostro detectado: {emotion} ({confidence * 100:.2f}%)")

        cv2.imshow("Detección de Emociones", frame)

        # Presionar 'q' para salir
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Función para detectar emoción al cargar una imagen
def detect_emotion_from_uploaded_image(image_path):
    if not os.path.exists(image_path):
        print("La ruta de la imagen no es válida.")
        return

    image = cv2.imread(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Detectar rostros en la imagen
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        face = rgb_image[y:y+h, x:x+w]
        emotion, confidence = detect_emotion_in_image(face)

        # Dibujar un rectángulo alrededor del rostro y mostrar la emoción
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        label = f"{emotion} ({confidence * 100:.2f}%)"
        cv2.putText(image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # Mostrar en consola la emoción detectada
        print(f"Rostro detectado: {emotion} ({confidence * 100:.2f}%)")

    # Mostrar la imagen con las emociones detectadas
    resized_image = cv2.resize(image, (600, 600))  # Ajustar tamaño para visualización
    cv2.imshow("Emoción detectada", resized_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Ejecución del programa
if __name__ == "__main__":
    print("Selecciona una opción:")
    print("1. Detectar emoción en tiempo real con la cámara")
    print("2. Detectar emoción desde una imagen cargada")
    
    choice = input("Ingresa el número de tu opción: ")

    if choice == '1':
        detect_emotion_from_camera()
    elif choice == '2':
        image_path = input("Ingresa la ruta de la imagen: ")
        detect_emotion_from_uploaded_image(image_path)
    else:
        print("Opción no válida.")
