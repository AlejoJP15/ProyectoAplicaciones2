from .conexion_bd import get_db_connection
from psycopg2.extras import RealDictCursor

def insertar_interaccion(id_sesion, tipo_mensaje, mensaje):
    """
    Inserta una interacción en la tabla interacciones_chatbot asociada a una sesión.
    """
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO interacciones_chatbot (id_sesion, tipo_mensaje, mensaje, timestamp)
                    VALUES (%s, %s, %s, NOW());
                """, (id_sesion, tipo_mensaje, mensaje))
                conn.commit()
                print("Interacción insertada correctamente.")
        except Exception as e:
            print("Error al insertar la interacción en la base de datos:", e)
        finally:
            conn.close()
            
def obtener_interacciones(id_sesion):
    conn = get_db_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT * FROM interacciones_chatbot WHERE id_sesion = %s;
        """, (id_sesion,))
        return cur.fetchall()