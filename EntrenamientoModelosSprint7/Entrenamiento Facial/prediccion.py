import numpy as np
from tensorflow.keras.models import load_model # type: ignore
import cv2

def predecir_emocion(model_path, img_path, class_labels):
    """
    Predice la emoción en una imagen.

    :param model_path: Ruta al modelo guardado.
    :param img_path: Ruta a la imagen a predecir.
    :param class_labels: Diccionario con las etiquetas de las clases.
    :return: Etiqueta de la emoción predicha.
    """
    # Cargar modelo
    model = load_model(model_path)

    # Leer y preprocesar la imagen
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (48, 48)).reshape(1, 48, 48, 1) / 255.0

    # Realizar predicción
    prediction = model.predict(img)
    predicted_class = np.argmax(prediction)
    return class_labels[str(predicted_class)]
