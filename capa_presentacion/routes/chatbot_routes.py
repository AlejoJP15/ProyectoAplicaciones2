from flask import Blueprint, request, jsonify
from capa_logica.chatbot_service import procesar_chatbot

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    prompt = data.get("prompt")
    id_sesion = data.get("id_sesion")

    if not prompt:
        return jsonify({"error": "No se proporcionó un prompt"}), 400

    respuesta, id_sesion = procesar_chatbot(prompt, id_sesion)
    return jsonify({"response": respuesta, "id_sesion": id_sesion})
