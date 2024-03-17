from psw_api import psw_api
from random import randint, random, choice
from time import sleep


# int, float, string, list
# min, max, pf조건 등
class aa:
    config = {
        "test_parameter": {
            "측정 횟수": {"type": "int"},
            "VBAT": {"type": "int"},
            "Load": {"type": "float"},
            "그래프 1번 라벨": {"type": "string"},
            "그래프 2번 라벨": {"type": "string"},
            "Vout": {"type": "list", "list": ["Min", "Typ", "Max"]},
            "Block": {
                "type": "list",
                "list": [
                    "B1S1",
                    "B1S2",
                    "B1S3",
                    "B2S1",
                    "B2S2",
                    "B2S3",
                    "B3S1",
                    "B3S2",
                    "B3S3",
                ],
                "multi_select": True,
            },
        }
    }

    def aaa(self, PSW_API: psw_api, parameters):
        header = [
            "Block",
            "VBAT",
            "Load",
            "Vout",
            "Target Vout",
            "Accuracy",
            "pk-pk",
            "P/F",
        ]
        PSW_API.set_table_header(header)
        PSW_API.add_log("장비 설정", 2)
        for i in range(int(parameters["측정 횟수"])):
            PSW_API.reset_chart()
            random_data1 = [randint(0, 100) for _ in range(100)]
            result = [
                {"x": 0 + i * 0.001, "y": value} for i, value in enumerate(random_data1)
            ]
            PSW_API.add_dataset_chart(label=parameters["그래프 1번 라벨"], data=result)
            random_data2 = [randint(50, 150) for _ in range(100)]
            result = [
                {"x": 0 + i * 0.001, "y": value} for i, value in enumerate(random_data2)
            ]
            PSW_API.add_dataset_chart(label=parameters["그래프 2번 라벨"], data=result)
            data = []
            data.append(choice(parameters["Block"]))
            data.append(parameters["VBAT"])
            data.append(parameters["Load"])
            data.append(parameters["Vout"])
            data.append("min")
            data.append(round(random() * 100, 3))
            data.append(round(random() * 100, 3))
            data.append("Pass")
            PSW_API.add_table_body(data)
            PSW_API.add_log("{}번째 데이터 측정".format(i + 1))
            sleep(0.1)
