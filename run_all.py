import subprocess
import time
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Directorio raíz del proyecto

def ejecutar_backend_python():
    """Inicia el backend principal en Python usando el entorno virtual."""
    print("Iniciando backend principal en Python...")
    python_path = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")  # Ruta al Python del venv
    app_path = os.path.join(BASE_DIR, "capa_presentacion", "app.py")       # Ruta al app.py
    if not os.path.exists(python_path):
        print("Error: No se encontró el entorno virtual en 'venv/Scripts/python.exe'")
        return
    if not os.path.exists(app_path):
        print("Error: No se encontró 'app.py' en capa_presentacion")
        return
    subprocess.Popen([python_path, app_path], cwd=os.path.join(BASE_DIR, "capa_presentacion"), shell=True)

def ejecutar_backend_node():
    """Inicia el microservicio del chatbot en Node.js."""
    print("Iniciando microservicio del chatbot en Node.js...")
    subprocess.Popen(["node", "index.js"], cwd=os.path.join(BASE_DIR, "CHATBOTAP", "backend"), shell=True)

def ejecutar_frontend_react():
    """Inicia el frontend React del chatbot."""
    print("Iniciando frontend React...")
    subprocess.Popen(["npm", "start"], cwd=os.path.join(BASE_DIR, "CHATBOTAP", "frontend/src"), shell=True)

if __name__ == "__main__":
    try:
        print("=== Ejecutando todos los servicios del programa ===\n")

        # Ejecutar backend principal en Python
        ejecutar_backend_python()
        time.sleep(5)  # Esperar unos segundos para que Flask inicie

        # Ejecutar microservicio Node.js
        ejecutar_backend_node()
        time.sleep(3)  # Esperar unos segundos para que Node.js inicie

        # Ejecutar frontend React
        ejecutar_frontend_react()

        print("\n=== Todos los servicios se han iniciado correctamente ===")
        print("Backend Python: http://localhost:5000")
        print("Microservicio Node.js: http://localhost:3001")
        print("Frontend React: http://localhost:3000")

    except KeyboardInterrupt:
        print("\nEjecución interrumpida manualmente.")
