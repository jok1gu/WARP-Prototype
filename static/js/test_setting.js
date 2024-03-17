var socket = io.connect();
document.addEventListener("DOMContentLoaded", function () {
    socket.on("connect", function () {
        let thisfilefullname = document.URL.substring(document.URL.lastIndexOf('/') + 1, document.URL.length);
        console.log("connect - " + thisfilefullname);
    });
    let test_case_list = document.getElementById("test_case_list");
    let test_suite_list = document.getElementById("test_suite_list");
    let test_suite_btn_group = document.getElementById("test_suite_btn_group");
    let test_parameter_container = document.getElementById("test_parameter_container");
    let selected_test_suite_items = {};
    let last_test_suite_idx;
    let test_suite_idx = 0;
    let current_test_parameter = {};
    new Sortable(test_case_list, {
        group: {
            name: 'test',
            pull: 'clone',
            put: false
        },
        animation: 150,
        sort: false
    });
    new Sortable(test_suite_list, {
        group: {
            name: 'test',
        },
        animation: 150,
        multiDrag: true,
        multiDragKey: 'ctrl',
        avoidImplicitDeselect: true,
        selectedClass: 'text-bg-primary',
        onSelect: function (evt) {
            selected_test_suite_items = evt.items;
            let selected_test_suite_idx = Number(evt.item.getAttribute("data-idx"));
            socket.emit("select_test_suite", selected_test_suite_idx);
        },
        onDeselect: function (evt) {
            selected_test_suite_items = evt.items;
        },
        onAdd: function (evt) {
            evt.item.setAttribute("data-idx", test_suite_idx);
            socket.emit("test_case_to_test_suite", test_suite_idx, evt.item.innerText);
            test_suite_idx++;
        },
    });
    test_suite_btn_group.addEventListener("click", function (event) {
        const target = event.target;
        if (target.dataset.type == "test_suite") {
            if (target.dataset.action == "load") {
                load_test_suite();
            }
            else if (target.dataset.action == "save") {
                save_test_suite();
            }
            else if (target.dataset.action == "delete") {
                delete_test_suite_items(selected_test_suite_items);
            }
        }
    });
    test_suite_list.addEventListener("click", function (event) {
        const target = event.target;
        last_test_suite_idx = Number(target.getAttribute("data-idx"));
    });
    test_parameter_container.addEventListener("click", function (event) {
        const target = event.target;
        if (target.matches('button')) {
            if (target.dataset.action == 'delete') {
                let divInput = target.parentElement.nextElementSibling;
                if (divInput.lastElementChild.dataset.idx == "0") {
                    return;
                }
                else {
                    current_test_parameter[divInput.lastElementChild.name].value.pop();
                    divInput.lastElementChild.remove();
                    save_test_parameter();
                }
            }
            else if (target.dataset.action == 'add') {
                let divInput = target.parentElement.nextElementSibling;
                let lastNode = divInput.lastElementChild.cloneNode();
                lastNode.dataset.idx = Number(lastNode.dataset.idx) + 1;
                current_test_parameter[divInput.lastElementChild.name].value.push(lastNode.value);
                divInput.append(lastNode);
                save_test_parameter();
            }
        }
    });
    test_parameter_container.addEventListener("change", function (event) {
        const target = event.target;
        save_test_parameter(target);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key == 'Delete') {
            delete_test_suite_items(selected_test_suite_items);
        }
    });
    function save_test_parameter(target) {
        if (target == undefined) {
        }
        else if (target.type === 'checkbox') {
            current_test_parameter[target.id]["value"][target.dataset.idx] = target.checked;
        } else if (target.type === 'radio') {
            if (target.checked) {
                current_test_parameter[target.name][target.dataset.idx] = target.value;
            }
        } else if (target.type === 'select-one') {
            current_test_parameter[target.id]["value"][target.dataset.idx] = target.value;
        } else if (target.type === 'select-multiple') {
            const selectedOptions = Array.from(target.selectedOptions).map(option => option.value);
            current_test_parameter[target.id]["value"][target.dataset.idx] = selectedOptions;
        } else if (["number", "text"].includes(target.type)) {
            current_test_parameter[target.name]["value"][target.dataset.idx] = target.value;
        }
        socket.emit("save_test_parameter", last_test_suite_idx, current_test_parameter);
    }
    function save_test_suite() {
        let file_name = prompt("파일이름 :");
        let test_suite_sequence = [];
        test_suite_list.querySelectorAll("[data-idx]").forEach(test_item => {
            test_suite_sequence.push(Number(test_item.getAttribute("data-idx")));
        });
        socket.emit("save_test_suite", file_name, test_suite_sequence);
    }
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
    function delete_test_suite_items(items) {
        if (Object.keys(items).length != 0) {
            for (let key in items) {
                let item = items[key];
                item.parentNode.removeChild(item);
            }
            selected_test_suite_items = {};
            clear_test_parameter();
        }
    }
    function clear_test_parameter() {
        test_parameter_container.innerHTML = '';
    }
    function createDivKey(key, parameter) {
        let div = document.createElement('div');
        div.className = 'd-flex align-items-center';
        let label = createLabel(key, parameter);
        div.append(label);
        let minusBtn = createBtn('-');
        let plusBtn = createBtn('+');
        div.append(minusBtn);
        div.append(plusBtn);
        return div;
    }
    function createDivValue(key, parameter) {
        let div = document.createElement('div');
        div.className = 'd-flex align-items-center';
        parameter["value"].forEach((value, index) => {
            let input = createInput(key, parameter["type"], index, value);
            div.append(input);
        });
        return div;
    }
    function createLabel(key, parameter) {
        let label = document.createElement('label');
        label.textContent = key + " (" + parameter["type"] + ') :';
        label.className = 'form-label mb-0 me-auto';
        label.htmlFor = key;
        return label;
    }
    function createBtn(text) {
        let button = document.createElement('button');
        button.textContent = text;
        if (text == '-') {
            button.dataset.action = "delete";
        }
        else if (text == '+') {
            button.dataset.action = "add";
        }
        button.className = 'btn btn-primary btn-sm float-right me-1';
        return button;
    }
    function createInput(key, type, idx, value = undefined) {
        let input = document.createElement('input');
        if (type == 'int') {
            input.type = "number";
        }
        else if (type == 'float') {
            input.type = "number";
        }
        else if (type == 'string') {
            input.type = "text";
        }
        input.className = 'form-control mb-2 me-1';
        input.name = key;
        input.dataset.idx = idx;
        input.placeholder = key + " (" + type + ')';
        if (value != undefined) {
            input.value = value;
        }
        return input;
    }
    socket.on("load_test_parameter", function (test_parameter) {
        current_test_parameter = test_parameter;
        clear_test_parameter();
        for (let key in test_parameter) {
            if (["int", "float", "string"].includes(test_parameter[key].type)) {
                const divkey = createDivKey(key, test_parameter[key]);
                const divValue = createDivValue(key, test_parameter[key]);
                test_parameter_container.append(divkey);
                test_parameter_container.append(divValue);
            }
            else if (test_parameter[key].type == 'list') {
                const label = createLabel(key, test_parameter[key].type);
                const select = document.createElement('select');
                select.className = 'form-select mb-2';
                select.name = key;
                select.id = key;
                if (test_parameter[key].multi_select) {
                    select.multiple = true;
                }
                test_parameter[key].list.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.text = option;
                    if (test_parameter[key].multi_select) {
                        if (test_parameter[key]["value"]) {
                            if (test_parameter[key]["value"].some(elem => elem == option)) {
                                optionElement.selected = true
                            }
                        }
                    }
                    else {
                        if (test_parameter[key]["value"] == option) {
                            optionElement.selected = true;
                        }
                    }
                    select.appendChild(optionElement);
                });
                test_parameter_container.appendChild(label);
                test_parameter_container.appendChild(select);
            }
        }
    });
});