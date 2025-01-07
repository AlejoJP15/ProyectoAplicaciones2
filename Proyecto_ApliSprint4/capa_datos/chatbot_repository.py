from .conexion_bd import get_db_connection

def insertar_interaccion(tipo_mensaje, mensaje):
    """
    Inserta una interacción en la tabla interacciones_chatbot.
    """
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO interacciones_chatbot (tipo_mensaje, mensaje, timestamp)
                    VALUES (%s, %s, NOW());
                """, (tipo_mensaje, mensaje))
                conn.commit()
        except Exception as e:
            print("Error al insertar la interacción en la base de datos:", e)
        finally:
            conn.close()
