import sys
import os
import bcrypt 
import re
import psycopg2
# Agregar la ruta raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
import matplotlib.pyplot as plt
import requests
from capa_datos.chatbot_repository import insertar_interaccion
from capa_datos.conexion_bd import get_db_connection

app = Flask(__name__)
CORS(app)

# Ruta principal
@app.route("/")
def index():
    return "Bienvenido a la API de Flask. Use los endpoints: /api/chatbot, /register, /login, /logout, /api/graph."

# Manejo del favicon
@app.route('/favicon.ico')
def favicon():
    return '', 204

# Endpoint para el chatbot
@app.route("/api/chatbot", methods=["POST", "HEAD"])
def chatbot():
    if request.method == "HEAD":
        return "", 200
    
    data = request.get_json()
    prompt = data.get("prompt")
    id_sesion = data.get("id_sesion")  # Obtener id_sesion del frontend
    nombre_usuario = data.get("nombre_usuario")
    if not prompt or not id_sesion:
        return jsonify({"error": "Faltan datos requeridos (prompt o id_sesion)"}), 400

    try:
        # Llamar al microservicio Node.js
        response = requests.post(
            "http://localhost:3001/generateText",
            json={"prompt": prompt, "id_sesion": id_sesion}  # Enviar ambos datos
        )
        response_data = response.json()
        chatbot_response = response_data.get("response", "Error en la respuesta del chatbot")
        print("Respuesta del microservicio:", response_data)
        # Guardar las interacciones en la base de datos PostgreSQL
        insertar_interaccion(id_sesion, nombre_usuario, prompt)
        insertar_interaccion(id_sesion, "ChatGPT", chatbot_response)

        return jsonify({"response": chatbot_response})
    except Exception as e:
        print("Error al comunicarse con el microservicio Node.js:", e)
        return jsonify({"error": "Error en el procesamiento"}), 500




# Registro de usuarios
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    # Validar que el correo electrónico tenga un formato válido
    if not name or not email or not password:
        return jsonify({"success": False, "message": "Por favor completa todos los campos"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"success": False, "message": "Por favor ingresa un correo válido"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "La contraseña debe tener al menos 6 caracteres"}), 400

    # Encriptar la contraseña
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    conn = get_db_connection()

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM usuarios WHERE correo = %s", (email,))
            if cur.fetchone():
                return jsonify({"success": False, "message": "El correo ya está en uso"}), 400

            cur.execute(
            "INSERT INTO usuarios (nombre, correo, contraseña) VALUES (%s, %s, %s)",
            (name, email, hashed_password.decode("utf-8")),
        )
        conn.commit()
        return jsonify({"success": True, "message": "Usuario registrado exitosamente"})
    
    except psycopg2.IntegrityError as e:  # Manejar errores de integridad, como el correo duplicado
        conn.rollback()
        if "unique_email" in str(e):  # Asegúrate de que coincide con tu restricción de unicidad
            return jsonify({"success": False, "message": "El correo ya está en uso"}), 400
        return jsonify({"success": False, "message": "Error al registrar usuario"}), 500
    except Exception as e:
        conn.rollback()
        print("Error al registrar usuario:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500
    
    finally:
        conn.close()

# Inicio de sesión
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    dispositivo = data.get("dispositivo")
    canal = data.get("canal")
    email = email.strip() 
    
    if not email or not password:
        return jsonify({"success": False, "message": "Por favor completa todos los campos"}), 400
    
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"success": False, "message": "Por favor ingresa un correo válido"}), 400
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
        # Buscar usuario por correo
            cur.execute("SELECT * FROM usuarios WHERE correo = %s", (email,))
            user = cur.fetchone()

            if not user:
                return jsonify({"success": False, "message": "Correo o contraseña incorrecta"}), 404

            # Validar contraseña
            hashed_password = user[3]
            if not bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8")):
                return jsonify({"success": False, "message": "Correo o contraseña incorrecta"}), 401

            # Crear nueva sesión
            cur.execute(
                """
                INSERT INTO sesiones (id_usuario, dispositivo, canal, inicio_sesion, fin_sesion) 
                VALUES (%s, %s, %s, NOW(), NULL) 
                RETURNING id_sesion;
                """,
                (user[0], dispositivo, canal),
            )
            id_sesion = cur.fetchone()[0]
            conn.commit()
            rol = user[5]  # Cambiar según tu modelo de base de datos
        return jsonify({"success": True, "id_sesion": id_sesion, "nombre": user[1], "rol": rol})
    except psycopg2.Error as e:
        print("Error al iniciar sesión:", e)
        return jsonify({"success": False, "message": str(e)})
    finally:
        conn.close()


# Cierre de sesión
@app.route("/logout", methods=["POST"])
def logout():
    data = request.json
    id_sesion = data.get("id_sesion")

    if not id_sesion:
        return jsonify({"success": False, "message": "Se requiere el id_sesion"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Actualizar la hora de fin_sesion
        cur.execute("""
            UPDATE sesiones
            SET fin_sesion = NOW()
            WHERE id_sesion = %s AND fin_sesion IS NULL;
        """, (id_sesion,))
        conn.commit()

        # Verificar si se actualizó alguna fila
        if cur.rowcount == 0:
            return jsonify({"success": False, "message": "Sesión no encontrada o ya cerrada"}), 404

        return jsonify({"success": True, "message": "Sesión cerrada correctamente"})
    except Exception as e:
        print("Error al cerrar sesión:", e)
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


# Generar gráfica
# @app.route("/api/user-interactions", methods=["GET"])
# def generar_grafica():
#     session_id = request.args.get("session_id")
#     if not session_id:
#         return jsonify({"error": "Se requiere session_id"}), 400
# 
#     try:
#         conn = get_db_connection()
#         with conn.cursor() as cur:
#             cur.execute("""
#                 SELECT tipo_mensaje, COUNT(*) 
#                 FROM interacciones_chatbot
#                 WHERE id_sesion = %s
#                 GROUP BY tipo_mensaje;
#             """, (session_id,))
#             resultados = cur.fetchall()
# 
#         if not resultados:
#             return jsonify({"error": "No hay datos disponibles para esta sesión"}), 404
# 
#         # Crear la gráfica con Matplotlib
#         tipos = [row[0] for row in resultados]
#         cantidades = [row[1] for row in resultados]
# 
#         plt.figure(figsize=(8, 6))
#         plt.bar(tipos, cantidades, color=["skyblue", "lightgreen"])
#         plt.title("Interacciones del Chatbot")
#         plt.xlabel("Tipo de Mensaje")
#         plt.ylabel("Cantidad")
#         plt.tight_layout()
# 
#         # Guardar la gráfica en memoria
#         img = BytesIO()
#         plt.savefig(img, format="png")
#         img.seek(0)
#         plt.close()
# 
#         return send_file(img, mimetype="image/png")
#     except Exception as e:
#         print(f"Error al generar la gráfica: {e}")
#         return jsonify({"error": "Error interno del servidor"}), 500




if __name__ == "__main__":
    app.run(debug=True, port=5000)
