import os
import importlib
import json
from flask import request

test_suite_file_path = "./test_suite/"
test_case_file_path = "./test_case/"
loaded_modules = {}
test_parameter_data = {}


def load_module(file_name):
    if file_name in loaded_modules:
        return loaded_modules[file_name]
    module_name = os.path.splitext(file_name)[0]
    spec = importlib.util.spec_from_file_location(
        module_name, test_case_file_path + file_name
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    loaded_modules[file_name] = module
    return module


def init_common(socketio, PSW_API):
    @socketio.on("connect")
    def connect():
        test_parameter_data.clear()
        print("Client connect")

    @socketio.on("disconnect")
    def disconnect():
        print("Client disconnect", request.sid)

    @socketio.on("load_test_suite")
    def load_test_suite(file_name):
        with open(
            test_suite_file_path + file_name + ".json", "r", encoding="UTF-8"
        ) as f:
            test_suite = json.load(f)
        socketio.emit("load_test_suite", test_suite)
        test_parameter_data.clear()
        for idx, data in enumerate(test_suite):
            test_parameter_data[idx] = data
