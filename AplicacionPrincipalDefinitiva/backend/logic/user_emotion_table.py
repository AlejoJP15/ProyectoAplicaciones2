from data_access.access import obtener_emociones_sesion

def obtener_emociones_usuario(id_sesion):
    """
    Maneja el proceso de obtención de emociones asociadas a una sesión.
    """
    if not id_sesion:
        return None, "Se requiere el id_sesion"

    emociones = obtener_emociones_sesion(id_sesion)
    if not emociones:
        return None, "No se encontraron emociones para esta sesión"

    return emociones, None