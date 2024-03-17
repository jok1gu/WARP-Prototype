from psw_api import psw_api
from random import randint, random
from time import sleep


# int, float, string, list
# min, max, pf조건 등
class aa:
    config = {
        "test_parameter": {
            "loop count": {"type": "int"},
            "이름": {"type": "string"},
            "min": {"type": "int"},
            "max": {"type": "int"},
        }
    }

    def aaa(self, PSW_API: psw_api, parameters):
        header = [
            "loop count",
            "이름",
            "min",
            "max",
            "평균값",
        ]
        PSW_API.set_table_header(header)
        PSW_API.add_log("디버깅용", 3)
        PSW_API.add_log("테스트 시작")
        PSW_API.add_log("장비 설정", 2)
        for i in range(int(parameters["loop count"])):
            PSW_API.reset_chart()
            random_data1 = [
                randint(int(parameters["min"]), int(parameters["max"]))
                for _ in range(int(100))
            ]
            result = [{"x": 1 + i, "y": value} for i, value in enumerate(random_data1)]
            PSW_API.add_dataset_chart(label=parameters["이름"], data=result)
            data = []
            data.append(parameters["loop count"])
            data.append(parameters["이름"])
            data.append(parameters["min"])
            data.append(parameters["max"])
            data.append(sum(random_data1) / len(random_data1))
            PSW_API.add_table_body(data)
            sleep(0.1)
        PSW_API.add_log("측정 끝")
