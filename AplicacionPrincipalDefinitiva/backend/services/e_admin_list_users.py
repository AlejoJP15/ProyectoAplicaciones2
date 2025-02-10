from flask import Blueprint, jsonify, request
from logic.admin_list_users import gestionar_usuarios

admin_list_users_bp = Blueprint('admin_list_users', __name__)

@admin_list_users_bp.route("/lista_usuarios", methods=["GET", "DELETE"])
def gestionar_usuarios_endpoint():

    """
    Endpoint para obtener la lista de usuarios o eliminar un usuario.
    """
    method = request.method
    id_usuario = None

    if method == "DELETE":
        data = request.get_json()
        id_usuario = data.get("id_usuario")

    resultado, error = gestionar_usuarios(method, id_usuario)
    if error:
        return jsonify({"error": error}), 400 if method == "DELETE" else 500

    return jsonify(resultado)