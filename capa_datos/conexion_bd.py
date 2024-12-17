import psycopg2
import bcrypt
from datetime import datetime
from psycopg2.extras import RealDictCursor



def get_db_connection():
    return psycopg2.connect(
        host="localhost",      
        database="deteccion_emociones",  
        user="postgres",   
        password="966921" 
    )
