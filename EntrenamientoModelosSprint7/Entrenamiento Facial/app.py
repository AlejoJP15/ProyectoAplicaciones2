import sys
import os
import cv2
import numpy as np
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from tensorflow.keras.callbacks import ReduceLROnPlateau # type: ignore
from capa_datos.cargar_datos import cargar_datos
from capa_logica.reconocimiento_facial.modelo import construir_modelo
from capa_logica.reconocimiento_facial.prediccion import predecir_emocion
from tensorflow.keras.models import load_model # type: ignore
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# Configuración: Rutas y parámetros
DATA_DIR = "C:/Users/jeitl/OneDrive/Escritorio/Proyecto_Grado/dataset"
MODEL_PATH = "C:/Users/jeitl/OneDrive/Escritorio/Proyecto_Grado/modelos/reconocimiento_facial.keras"
CLASS_LABELS = {
    '0': 'Neutral',
    '1': 'Felicidad',
    '2': 'Tristeza',
    '3': 'Desprecio',
    '4': 'Ira',
    '5': 'Sorpresa',
    '6': 'Miedo',
    '7': 'Disgusto'
}

# Callback para ajustar el learning rate
lr_scheduler = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=1e-6,
    verbose=1
)

def entrenar_modelo():
    """
    Entrena el modelo de reconocimiento emocional.
    """
    print("Cargando datos para entrenamiento...")
    train_data, val_data, _ = cargar_datos(DATA_DIR)

    print("Construyendo el modelo...")
    model = construir_modelo(input_shape=(48, 48, 1), num_classes=8)

    print("Entrenando el modelo...")
    model.fit(
        train_data,
        validation_data=val_data,
        epochs=20,
        callbacks=[lr_scheduler]
    )

    print(f"Guardando el modelo en {MODEL_PATH}...")
    model.save(MODEL_PATH)
    print("Entrenamiento completado.")

def evaluar_modelo():
    """
    Evalúa el modelo en el conjunto de prueba.
    """
    print("Cargando modelo y datos de prueba...")
    model = load_model(MODEL_PATH)
    _, _, test_data = cargar_datos(DATA_DIR)

    print("Evaluando el modelo...")
    loss, accuracy = model.evaluate(test_data)
    print(f"Pérdida en prueba: {loss:.4f}")
    print(f"Precisión en prueba: {accuracy:.2%}")

    # Generar predicciones
    y_true = test_data.classes
    y_pred = model.predict(test_data)
    y_pred_classes = np.argmax(y_pred, axis=1)

    # Métricas avanzadas
    print("Reporte de clasificación:")
    print(classification_report(y_true, y_pred_classes, target_names=list(test_data.class_indices.keys())))

    # Matriz de confusión
    print("Matriz de confusión:")
    cm = confusion_matrix(y_true, y_pred_classes)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=test_data.class_indices.keys(), yticklabels=test_data.class_indices.keys())
    plt.xlabel('Predicción')
    plt.ylabel('Etiqueta Real')
    plt.title('Matriz de Confusión')
    plt.show()

def main():
    """
    Menú principal.
    """
    print("Bienvenido al sistema de Reconocimiento Emocional")
    print("1. Entrenar el modelo")
    print("2. Evaluar el modelo")
    print("3. Usar la cámara para reconocimiento emocional")
    opcion = input("Selecciona una opción (1, 2 o 3): ")

    if opcion == "1":
        entrenar_modelo()
    elif opcion == "2":
        evaluar_modelo()
    elif opcion == "3":
        print("Cargando modelo...")
        model = load_model(MODEL_PATH)
        print("Iniciando cámara... Presiona 'q' para salir.")
        cap = cv2.VideoCapture(0)
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
            for (x, y, w, h) in faces:
                roi_gray = gray[y:y+h, x:x+w]
                roi_resized = cv2.resize(roi_gray, (48, 48))
                roi_normalized = roi_resized.reshape(1, 48, 48, 1) / 255.0
                prediction = model.predict(roi_normalized)
                predicted_class = np.argmax(prediction)
                emotion_label = CLASS_LABELS[str(predicted_class)]
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                cv2.putText(frame, emotion_label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
            cv2.imshow("Reconocimiento Emocional", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        cap.release()
        cv2.destroyAllWindows()
    else:
        print("Opción no válida. Por favor, selecciona 1, 2 o 3.")

if __name__ == "__main__":
    main()
