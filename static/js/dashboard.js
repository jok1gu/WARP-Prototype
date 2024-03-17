const AXIS_TYPE = {
  default: 'default',
  multi: 'multi',
  stack: 'stack'
}
var axisType = AXIS_TYPE.default; // 0: 기본, 1: multi, 2: stack
const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  // grey: 'rgb(201, 203, 207)'
};
const CHART_COLORS_TRANSPARENT = {
  red: 'rgba(255, 99, 132, 0.1)',
  orange: 'rgba(255, 159, 64, 0.2)',
  yellow: 'rgba(255, 205, 86, 0.2)',
  green: 'rgba(75, 192, 192, 0.2)',
  blue: 'rgba(54, 162, 235, 0.2)',
  purple: 'rgba(153, 102, 255, 0.2)',
  // grey: 'rgba(201, 203, 207, 0.2)'
};
var myChart = null;
var socket = io.connect();
var ctx = document.getElementById("myChart");
var labels = [];
var data = [];
let logLevel = 1;
document.addEventListener("DOMContentLoaded", function () {
  ctx = document.getElementById("myChart");
  socket.on("connect", function () {
    console.log("connect");
  });
  // 초기 로그 레벨 설정
  setLogLevel(1);
  // 초기에는 빈 차트 생성
  resetChart([]);
});
document.querySelectorAll('input[type=radio][name=logLevel]').forEach(function (logLevelRadio) {
  logLevelRadio.addEventListener('change', function () {
    setLogLevel(Number(this.value));
  });
});
function runfunc() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/runfunc', true);
  xhr.send();
  xhr.onload = () => {
    console.log(xhr.responseText);
  }
}
// 차트 초기화 함수
function resetChart(datasets) {
  if (myChart) {
    myChart.destroy();
  }
  // 빈 차트 생성
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: datasets
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'ms'
          }
        },
      },
      elements: {
        point: {
          radius: 0,
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      animation: false,
      parsing: false,
      plugins: {
        legend: {
          onHover: handleLegendHover,
          onLeave: handleLegendLeave
        },
        decimation: {
          enabled: true,
          algorithm: 'min-max',
        },
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true
            }
          }
        }
      }
    }
  });
}
// Append '4d' to the colors (alpha channel), except for the hovered index
function handleLegendHover(e, legendItem, legend) {
  const index = legendItem.datasetIndex;
  const ci = legend.chart;
  for (let i = 0; i < ci.data.datasets.length; i++) {
    if (i == index) {
    }
    else {
      ci.data.datasets[i].borderColor = getColorTransparent(i);
    }
  }
  ci.update();
}
// Removes the alpha channel from background colors
function handleLegendLeave(e, legendItem, legend) {
  const index = legendItem.datasetIndex;
  const ci = legend.chart;
  for (let i = 0; i < ci.data.datasets.length; i++) {
    ci.data.datasets[i].borderColor = getColor(i);
  }
  ci.update();
}
// 차트 업데이트 함수
function buttonpress(label) {
  socket.emit('buttonpress', { label: label });
}
// 차트 초기화 함수 호출
function clearChart() {
  resetChart([]);
}
function setScaleDefault() {
  axisType = AXIS_TYPE.default;
  for (let i = 0; i < myChart.data.datasets.length; i++) {
    myChart.data.datasets[i].yAxisID = 'y0';
    if (i > 0) {
      if (myChart.options.scales['y' + i]) {
        myChart.options.scales['y' + i].display = false;
        delete myChart.options.scales['y' + i].stack;
      }
    }
  }
  myChart.update();
}
function setScaleMultiAxis() {
  axisType = AXIS_TYPE.multi;
  for (let i = 0; i < myChart.data.datasets.length; i++) {
    myChart.data.datasets[i].yAxisID = 'y' + i;
  }
  myChart.update();
  for (let i = 0; i < myChart.data.datasets.length; i++) {
    if (i > 0) {
      myChart.options.scales['y' + i].display = true;
      delete myChart.options.scales['y' + i].stack;
    }
  }
  myChart.update();
}
function setScaleStack() {
  axisType = AXIS_TYPE.stack;
  for (let i = 0; i < myChart.data.datasets.length; i++) {
    myChart.data.datasets[i].yAxisID = 'y' + i;
  }
  myChart.update();
  for (let i = 0; i < myChart.data.datasets.length; i++) {
    myChart.options.scales['y' + i].stack = 'y0';
    if (i > 0) {
      myChart.options.scales['y' + i].display = true;
      myChart.options.scales['y' + i].offset = true;
    }
  }
  myChart.update();
}
function resetZoom() {
  myChart.resetZoom();
}
function getColor(index) {
  return Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  // return Object.values(CHART_COLORS)[myChart.data.datasets.length % Object.values(CHART_COLORS).length];
}
function getColorTransparent(index) {
  return Object.values(CHART_COLORS_TRANSPARENT)[index % Object.values(CHART_COLORS_TRANSPARENT).length]
  // return Object.values(CHART_COLORS)[myChart.data.datasets.length % Object.values(CHART_COLORS).length];
}
function setScaleMinMax(idx) {
  myChart.options.scales['y' + idx].min = 10;
  myChart.options.scales['y' + idx].max = 500;
  myChart.update();
}
// chart 초기화
socket.on('reset_chart', function () {
  resetChart([]);
});
// 소켓 이벤트 리스너
socket.on('add_dataset_chart', function (data) {
  // xy 형식
  // console.log(data.data);
  const datasets =
  {
    label: data.label,
    data: data.data,
    borderColor: getColor(myChart.data.datasets.length % Object.values(CHART_COLORS).length),
    yAxisID: axisType == AXIS_TYPE.default ? 'y0' : 'y' + myChart.data.datasets.length,
  };
  myChart.data.datasets.push(datasets);
  myChart.update();
});
socket.on('set_axis_chart', function (axis) {
  if (myChart.options.scales['y' + axis.idx] == undefined) {
    myChart.options.scales['y' + axis.idx] = {};
    myChart.update();
  }
  for (let key in axis.option) {
    myChart.options.scales['y' + axis.idx][key] = axis.option[key];
  }
  myChart.update();
});
socket.on('set_table_header', function (header) {
  let thead = document.querySelector('#test_result_table > thead');
  thead.innerHTML = '';
  let rowHtml = header.map(head => `<th>${head}</th>`).join('');
  let tr = document.createElement('tr');
  tr.innerHTML = rowHtml;
  thead.appendChild(tr);
});
socket.on('reset_table_body', function () {
  let tbody = document.querySelector('#test_result_table > tbody');
  tbody.innerHTML = '';
});
socket.on('add_table_body', function (table_data) {
  let tbody = document.querySelector('#test_result_table > tbody');
  let rowHtml = table_data.map(data => `<td>${data}</td>`).join('');
  let tr = document.createElement('tr');
  tr.innerHTML = rowHtml;
  tbody.appendChild(tr);
  setScrollDown('table-container');
});
socket.on('reset_log', function () {
  let test_log = document.querySelector('#test_log');
  test_log.innerHTML = "";
});
socket.on('add_log', function (log) {
  let test_log = document.querySelector('#test_log');
  let text = document.createElement('div');
  if (logLevel < log.level) {
    text.style.display = 'none';
  }
  text.classList.add('log_' + log.level);
  text.textContent = getTimestamp() + ' || ' + log.text;
  test_log.appendChild(text);
  setScrollDown('test_log');
});
socket.on('config', function (config) {
  var config = config;
});
function setLogLevel(level) {
  logLevel = level;
  for (let i = 1; i <= level; i++) {
    document.querySelectorAll('.log_' + i).forEach(function (log) {
      log.style.display = 'block';
    });
  }
  for (let i = level + 1; i <= 3; i++) {
    document.querySelectorAll('.log_' + i).forEach(function (log) {
      log.style.display = 'none';
    });
  }
}
function getTimestamp() {
  let today = new Date();
  let year = today.getFullYear();
  let month = ('0' + (today.getMonth() + 1)).slice(-2);
  let day = ('0' + today.getDate()).slice(-2);
  let hours = ('0' + today.getHours()).slice(-2);
  let minutes = ('0' + today.getMinutes()).slice(-2);
  let seconds = ('0' + today.getSeconds()).slice(-2);
  let timeString = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  return timeString;
}
function testlog() {
  for (let i = 0; i < 50; i++) {
    let test_log = document.querySelector('#test_log');
    let text = document.createElement('div');
    text.classList.add('log_' + ((i % 3) + 1));
    text.textContent = getTimestamp() + ' || ' + "로그 레벨 : " + ((i % 3) + 1);
    test_log.appendChild(text);
    setScrollDown('test_log');
  }
}
function setScrollDown(name) {
  let space = document.getElementById(name);
  space.scrollTop = space.scrollHeight;
}
function runTest(file_name) {
  socket.emit('run_test', file_name);
}
function runCode() {
  let code = document.getElementById('code').value;
  socket.emit('run_code', code);
}
document.querySelector('#code').addEventListener('keydown', function (e) {
  if (e.key === 'Tab') {
    e.preventDefault(); // 기본 동작 취소
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const value = this.value;
    this.value = value.substring(0, start) + '\t' + value.substring(end);
    this.selectionStart = this.selectionEnd = start + 1; // 탭 문자 위치로 커서 이동
  }
});
socket.on('alert', function (text) {
  alert(text);
});
function load_test_suite() {
  let file_name = prompt("파일이름 :");
  socket.emit("load_test_suite", file_name);
}
socket.on("load_test_suite", function (test_suite_data) {
  test_suite_list.innerHTML = '';
  test_suite_data.forEach((data, idx) => {
    let div = document.createElement("div");
    div.className = "list-group-item list-group-item-action text-truncate";
    div.textContent = data.test_name;
    div.dataset.idx = idx;
    test_suite_list.appendChild(div);
  });
});
function start_test_suite() {
  socket.emit("start_test_suite");
}
function stop_test_suite() {
}