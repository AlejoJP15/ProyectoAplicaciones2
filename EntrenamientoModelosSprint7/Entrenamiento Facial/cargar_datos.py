from tensorflow.keras.preprocessing.image import ImageDataGenerator # type: ignore

def cargar_datos(data_dir, img_size=48, batch_size=32):
    """
    Carga datos desde un directorio estructurado en subcarpetas por clase,
    aplicando Data Augmentation al conjunto de entrenamiento.
    """
    # Data augmentation para entrenamiento
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    # Generador para validación y prueba (sin Data Augmentation)
    val_test_datagen = ImageDataGenerator(rescale=1./255)

    train_data = train_datagen.flow_from_directory(
        f"{data_dir}/train",
        target_size=(img_size, img_size),
        color_mode="grayscale",
        batch_size=batch_size,
        class_mode="categorical"
    )

    val_data = val_test_datagen.flow_from_directory(
        f"{data_dir}/val",
        target_size=(img_size, img_size),
        color_mode="grayscale",
        batch_size=batch_size,
        class_mode="categorical"
    )

    test_data = val_test_datagen.flow_from_directory(
        f"{data_dir}/test",
        target_size=(img_size, img_size),
        color_mode="grayscale",
        batch_size=batch_size,
        class_mode="categorical"
    )

    return train_data, val_data, test_data

