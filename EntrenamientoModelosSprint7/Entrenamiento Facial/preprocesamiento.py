import os
import pandas as pd
import shutil
from sklearn.model_selection import train_test_split

# Configuración
BASE_DIR = r'C:\Users\alejo\OneDrive\Documentos\PYTHON\ReconocimientoEmocional\data'
PROCESSED_DIR = os.path.join(BASE_DIR, 'processed_data')
EMOCIONES_SELECCIONADAS = ['anger', 'happy', 'neutral', 'sad', 'surprise']

# Leer el archivo labels.csv
labels_path = os.path.join(BASE_DIR, 'labels.csv')
df = pd.read_csv(labels_path)

# Filtrar las emociones seleccionadas
df = df[['pth', 'label']]
df = df[df['label'].isin(EMOCIONES_SELECCIONADAS)]

# Crear directorios para datos procesados
if os.path.exists(PROCESSED_DIR):
    shutil.rmtree(PROCESSED_DIR)
os.makedirs(os.path.join(PROCESSED_DIR, 'train'))
os.makedirs(os.path.join(PROCESSED_DIR, 'val'))

# Dividir en entrenamiento y validación (80-20)
train_df, val_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=42)

# Función para copiar imágenes a las carpetas correspondientes
def copiar_imagenes(dataframe, destino):
    for _, row in dataframe.iterrows():
        emocion = row['label']
        origen = os.path.join(BASE_DIR, row['pth'])
        destino_emocion = os.path.join(destino, emocion)
        if not os.path.exists(destino_emocion):
            os.makedirs(destino_emocion)
        shutil.copy(origen, destino_emocion)

copiar_imagenes(train_df, os.path.join(PROCESSED_DIR, 'train'))
copiar_imagenes(val_df, os.path.join(PROCESSED_DIR, 'val'))

print("Preprocesamiento completado. Datos organizados en 'processed_data'.")
