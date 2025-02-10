import os

def menu_principal():
    print("===== Proyecto de Reconocimiento de Emociones =====")
    print("Selecciona una opción:")
    print("1. Entrenar el modelo con el dataset")
    print("2. Usar el modelo para detección de emociones (cámara o imagen)")
    print("3. Salir")

    opcion = input("Ingresa el número de tu elección: ")

    if opcion == "1":
        os.system("python entrenar_modelo.py")
    elif opcion == "2":
        os.system("python detectar_emocion.py")
    elif opcion == "3":
        print("Saliendo del programa...")
    else:
        print("Opción no válida. Intenta nuevamente.")
        menu_principal()

if __name__ == "__main__":
    menu_principal()
