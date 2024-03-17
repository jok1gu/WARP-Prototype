import importlib.util
import json
import os
from random import random, randrange, randint
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from psw_api import psw_api
from main.common import init_common
from main.dashboard import dashboard_bp, init_dashboard
from main.test_setting import test_setting_bp, init_test_setting

# Flask 애플리케이션 생성
app = Flask(__name__)
app.config["SECRET_KEY"] = "asdf"
app.register_blueprint(dashboard_bp)
app.register_blueprint(test_setting_bp)
socketio = SocketIO(app, cors_allowed_origins="*")
PSW_API = psw_api(socketio)
init_common(socketio, PSW_API)
init_dashboard(socketio, PSW_API)
init_test_setting(socketio, PSW_API)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=80, debug=True)
