import subprocess
import time
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Directorio raíz del proyecto

def ejecutar_backend_python():
    print("Iniciando backend principal en Python...")
    app_path = os.path.join(BASE_DIR, "capa_presentacion", "app.py")
    if not os.path.exists(app_path):
        print("Error: No se encontró 'app.py' en capa_presentacion")
        return
    subprocess.Popen(["python", app_path], cwd=os.path.join(BASE_DIR, "capa_presentacion"), shell=True)

def ejecutar_backend_node():
    print("Iniciando microservicio del chatbot en Node.js...")
    node_path = os.path.join(BASE_DIR, "CHATBOTAP", "backend", "index.js")
    if not os.path.exists(node_path):
        print("Error: No se encontró 'index.js' en CHATBOTAP/backend")
        return
    subprocess.Popen(["node", "index.js"], cwd=os.path.join(BASE_DIR, "CHATBOTAP", "backend"), shell=True)

def ejecutar_frontend_react(frontend_name, port):
    print(f"Iniciando frontend React: {frontend_name} en el puerto {port}...")
    frontend_path = os.path.join(BASE_DIR, frontend_name)
    if not os.path.exists(frontend_path):
        print(f"Error: No se encontró la carpeta '{frontend_name}'")
        return
    env = os.environ.copy()
    env["PORT"] = str(port)
    subprocess.Popen(["npm", "start"], cwd=frontend_path, shell=True, env=env)

if __name__ == "__main__":
    try:
        print("=== Ejecutando todos los servicios del programa ===\n")

        # Backend Python
        ejecutar_backend_python()
        time.sleep(5)

        # Microservicio Node.js
        ejecutar_backend_node()
        time.sleep(3)

        # Frontend Principal (3000)
        ejecutar_frontend_react("frontend", 3000)
        time.sleep(3)

        # Frontend Chatbot (3002)
        ejecutar_frontend_react(os.path.join("CHATBOTAP", "frontend"), 3002)

        print("\n=== Todos los servicios se han iniciado correctamente ===")
        print("Backend Python: http://localhost:5000")
        print("Microservicio Node.js: http://localhost:3001")
        print("Frontend Principal: http://localhost:3000")
        print("Frontend Chatbot: http://localhost:3002")

    except KeyboardInterrupt:
        print("\nEjecución interrumpida manualmente.")
    except Exception as e:
        print(f"\nError al iniciar los servicios: {e}")
