from flask import render_template, Blueprint
import json
import os
from main.common import (
    test_suite_file_path,
    test_case_file_path,
    load_module,
    test_parameter_data,
)

test_setting_bp = Blueprint("test_setting", __name__)


# 특정 폴더에 있는 파일 이름을 리스트로 가져오는 함수
def get_file_names(folder_path):
    file_names = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".py"):
            file_names.append(file_name)
    return file_names


@test_setting_bp.route("/test_setting")
def test_setting():
    # 특정 폴더에 있는 파일 이름 리스트
    test_case_names = get_file_names(test_case_file_path)
    # HTML 템플릿 렌더링
    return render_template("test_setting.html", test_case_names=test_case_names)


def init_test_setting(socketio, PSW_API):
    @socketio.on("test_case_to_test_suite")
    def test_case_to_test_suite(test_item_idx, test_name):
        test_parameter_data[test_item_idx] = get_config(test_name)
        print(test_parameter_data)

    def get_config(test_name):
        module = load_module(test_name)
        print(module)
        cls = getattr(module, "aa")()
        config = getattr(cls, "config")
        config["test_name"] = test_name
        for key in config["test_parameter"]:
            if not "value" in config["test_parameter"][key]:
                config["test_parameter"][key]["value"] = [""]
        return config.copy()

    # Test Suite 리스트에서 Test Case를 선택했을시 호출
    @socketio.on("select_test_suite")
    def select_test_item_idx(test_item_idx):
        socketio.emit(
            "load_test_parameter", test_parameter_data[test_item_idx]["test_parameter"]
        )

    @socketio.on("save_test_parameter")
    def save_test_setting(test_item_idx, setting_data):
        test_parameter_data[test_item_idx]["test_parameter"] = setting_data

    @socketio.on("save_test_suite")
    def save_test_suite(file_name, test_suite_sequence):
        test_suite = []
        for test_suite_idx in test_suite_sequence:
            test_suite.append(test_parameter_data[test_suite_idx])
        with open(
            test_suite_file_path + file_name + ".json", "w", encoding="UTF-8"
        ) as f:
            json.dump(test_suite, f, indent=4, ensure_ascii=False)
