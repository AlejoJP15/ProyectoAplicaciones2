from data_access.access import obtener_usuarios, delete_user_and_sessions


def gestionar_usuarios(method, id_usuario=None):

    """
    Maneja el proceso de obtener o eliminar usuarios.
    """
    if method == "GET":
        usuarios = obtener_usuarios()
        return usuarios, None
    elif method == "DELETE":
        if not id_usuario:
            return None, "Falta id Usuario"

        resultado = delete_user_and_sessions(id_usuario)
        if isinstance(resultado, tuple) and len(resultado) == 2:
            success, message = resultado
        else:
            success = resultado
            message = "Operación completada" if success else "Error al eliminar usuario"

        return {"mensaje": message}, None
    else:
        return None, "Método no permitido"