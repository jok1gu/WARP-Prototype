from attrs import define
from flask_socketio import SocketIO


@define
class psw_api:
    socketio: SocketIO
    test_condition = {}
    result_path = None
    chart_datasets = []
    chart_options = {
        "maintainAspectRatio": False,
        "scales": {
            "x": {"type": "linear", "title": {"display": True, "text": "ms"}},
        },
        "elements": {
            "point": {
                "radius": 0,
            }
        },
        "interaction": {
            "mode": "index",
            "intersect": False,
        },
        "animation": False,
        "parsing": False,
        "plugins": {
            "legend": {"onHover": "handleHover", "onLeave": "handleLeave"},
            "decimation": {
                "enabled": True,
                "algorithm": "min-max",
            },
            "zoom": {
                "pan": {
                    "enabled": True,
                },
                "zoom": {"wheel": {"enabled": True}},
            },
        },
    }

    def socket_emit(self, event: str, *args):
        self.socketio.emit(event, *args)

    # 테스트 조건
    # 결과 저장 폴더
    def reset_chart(self):
        self.socketio.emit("reset_chart")
        self.chart_datasets.clear()

    def add_dataset_chart(self, label: str | int, data: list):
        # xy 형식
        dataset = {"label": label, "data": data}
        self.socketio.emit("add_dataset_chart", dataset)
        self.chart_datasets.append(dataset)

    def set_axis_chart(
        self,
        idx: int,
        display: bool = None,
        position: str = None,
        min: float = None,
        max: float = None,
    ):
        axis = {"idx": idx, "option": {}}
        if display:
            axis["option"]["display"] = display
        if position:
            axis["option"]["position"] = position
        if min:
            axis["option"]["min"] = min
        if max:
            axis["option"]["max"] = max
        self.socketio.emit("set_axis_chart", axis)

    def set_table_header(self, header: list):
        self.socketio.emit("set_table_header", header)

    def reset_table_body(self):
        self.socketio.emit("reset_table_header")

    def add_table_body(self, table_data: list):
        self.socketio.emit("add_table_body", table_data)

    def reset_log(self):
        self.socketio.emit("reset_log")

    def add_log(self, text: str, level: int = 1):
        self.socketio.emit("add_log", {"text": text, "level": level})

    def waveform_to_xy(self, t0: float, dt: float, y: list):
        return [{"x": t0 + i * dt, "y": value} for i, value in enumerate(y)]
