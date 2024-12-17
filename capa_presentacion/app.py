import sys
import os

# Agregar la ruta raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file
from io import BytesIO
import requests
from flask_cors import CORS 
from capa_datos.chatbot_repository import insertar_interaccion
from capa_datos.conexion_bd import get_db_connection

app = Flask(__name__)
CORS(app)  
@app.route("/api/chatbot", methods=["POST", "HEAD"])
def chatbot():
    if request.method == "HEAD":
        # Solo devolver encabezados HTTP sin cuerpo
        return "", 200
    data = request.get_json()
    prompt = data.get("prompt")

    if not prompt:
        return jsonify({"error": "No se proporcionó un prompt"}), 400

    try:
        # Llamar al microservicio Node.js
        response = requests.post("http://localhost:3001/generateText", json={"prompt": prompt})
        response_data = response.json()
        chatbot_response = response_data.get("response", "Error en la respuesta del chatbot")

        # Guardar las interacciones en la base de datos PostgreSQL
        insertar_interaccion("Usuario", prompt)
        insertar_interaccion("ChatGPT", chatbot_response)

        return jsonify({"response": chatbot_response})
    except Exception as e:
        print("Error al comunicarse con el microservicio Node.js:", e)
        return jsonify({"error": "Error en el procesamiento"}), 500
    
@app.route("/api/graph", methods=["GET"])
def generar_grafica():
    """
    Genera una gráfica de interacciones del chatbot y devuelve la imagen.
    """
    try:
        # Conectar a la base de datos
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Consultar el número de interacciones por tipo
            cur.execute("""
                SELECT tipo_mensaje, COUNT(*) 
                FROM interacciones_chatbot
                GROUP BY tipo_mensaje;
            """)
            resultados = cur.fetchall()
        conn.close()

        # Preparar los datos para la gráfica
        tipos = [row[0] for row in resultados]
        cantidades = [row[1] for row in resultados]

        # Crear la gráfica
        plt.figure(figsize=(8, 6))
        plt.bar(tipos, cantidades, color=["skyblue", "lightgreen"])
        plt.title("Interacciones del Chatbot")
        plt.xlabel("Tipo de Mensaje")
        plt.ylabel("Cantidad")
        plt.tight_layout()

        # Guardar la gráfica en memoria y devolverla
        img = BytesIO()
        plt.savefig(img, format="png")
        img.seek(0)
        plt.close()

        return send_file(img, mimetype="image/png")
    except Exception as e:
        print("Error al generar la gráfica:", e)
        return jsonify({"error": "Error al generar la gráfica"}), 500
if __name__ == "__main__":
    app.run(debug=True, port=5000)