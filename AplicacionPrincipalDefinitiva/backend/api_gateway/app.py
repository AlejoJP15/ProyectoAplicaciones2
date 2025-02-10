from flask import Flask
from flask_cors import CORS  # Importar CORS
from connection.db_config import init_db
from services.e_login import login_bp
from services.e_logout import logout_bp
from services.e_register import register_bp
from services.e_update import user_bp
from services.e_emotion_table import emotion_bp
from services.e_facial_recognition import emotion_recognition_bp
from services.e_admin_inition import admin_bp
from services.e_admin_list_users import admin_list_users_bp

app = Flask(__name__)

CORS(app)

init_db(app)

app.register_blueprint(login_bp)
app.register_blueprint(logout_bp)
app.register_blueprint(register_bp)
app.register_blueprint(user_bp)
app.register_blueprint(emotion_bp)
app.register_blueprint(emotion_recognition_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(admin_list_users_bp)


# Ruta de prueba
@app.route('/')
def hello():
    return "¡Conexión a la base de datos configurada correctamente!"


if __name__ == '__main__':
    app.run(debug=True)