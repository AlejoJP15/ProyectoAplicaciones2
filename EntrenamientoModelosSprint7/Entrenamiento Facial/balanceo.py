import os
import shutil
import numpy as np
from collections import Counter

# Configuración
BASE_DIR = r'C:\Users\alejo\OneDrive\Documentos\PYTHON\ReconocimientoEmocional\data\processed_data'
BALANCED_DIR = os.path.join(BASE_DIR, 'balanced_data')

# Función para balancear clases
def balancear_clases(origen, destino):
    if os.path.exists(destino):
        shutil.rmtree(destino)
    os.makedirs(destino)

    for split in ['train', 'val']:
        split_dir = os.path.join(origen, split)
        destino_split_dir = os.path.join(destino, split)
        os.makedirs(destino_split_dir, exist_ok=True)

        class_counts = Counter([d for d in os.listdir(split_dir)])
        max_count = max(class_counts.values())

        for emocion in os.listdir(split_dir):
            emocion_dir = os.path.join(split_dir, emocion)
            destino_emocion_dir = os.path.join(destino_split_dir, emocion)
            os.makedirs(destino_emocion_dir, exist_ok=True)

            imagenes = os.listdir(emocion_dir)
            if len(imagenes) < max_count:
                # Sobremuestreo
                extras = np.random.choice(imagenes, max_count - len(imagenes), replace=True)
                imagenes.extend(extras)

            for img in imagenes:
                origen_img = os.path.join(emocion_dir, img)
                destino_img = os.path.join(destino_emocion_dir, img)
                shutil.copy(origen_img, destino_img)

balancear_clases(BASE_DIR, BALANCED_DIR)
print(f"Balanceo completado. Datos organizados en: {BALANCED_DIR}")
