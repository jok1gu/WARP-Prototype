import json
from flask import Blueprint, render_template
from main.common import load_module, test_suite_file_path, test_parameter_data


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


def init_dashboard(socketio, PSW_API):
    @socketio.on("start_test_suite")
    def start_test_suite():
        print(test_parameter_data)
        for parameter in test_parameter_data.values():
            module = load_module(parameter["test_name"])
            param = {}
            for key, value in parameter["test_parameter"].items():
                param[key] = value["value"] if "value" in value else ""
            cls = getattr(module, "aa")()
            getattr(cls, "aaa")(PSW_API, param)

    @socketio.on("run_code")
    def run_code(code):
        try:
            exec(code, {"PSW_API": PSW_API})
        except Exception as e:
            print(e)
            socketio.emit("alert", str(e))
        else:
            socketio.emit("alert", "성공")
