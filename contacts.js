// Сборка CSV
function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ';'
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

// Экспорт CSV
function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
        items.unshift(headers);
    }

    var jsonObject = JSON.stringify(items);
    var csv = this.convertToCSV(jsonObject);
    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) { 
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { 

            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            link.click();
        }
    }
}

// Обработка неопределенных значений
function check_contacts_data(nameKey, myArray) {
    data = myArray.find(x => x.name === nameKey);
    if (typeof data != "undefined") {
        return data['value'];
    } else {
        return "-";
    }
}

// Обработка на пустых значений
function check_null(data) {
    if (data !== null && data !== "") {
        return data;
    } else {
        return "-";
    }
}

// Наименование итогового файла
var fileTitle = 'users';
var itemsFormatted = [];
var items = [];

// Заголовки результирующего CSV
var headers = {
    company: "Компания",
    firs_name: "Имя",
    last_name: "Фамиллия",
    middle_name: "Отчество",
    position: "Должность",
    username: "Логин",
    email: "E-Mail",
    phone_work: "Рабочий",
    phone_mobile: "Мобильный",
    skype: "Skype",
    icq: "ICQ",
};

// Формат для результирующего CSV
function format_data() {
    items.forEach((item) => {
        console.log(item);
        itemsFormatted.push({
            company: check_null(item.company),
            first_name: check_null(item.first_name),
            last_name: check_null(item.last_name),
            middle_name: check_null(item.middle_name),
            position: check_null(item.position),
            username: check_null(item.username),
            email: check_contacts_data("E-mail", item.contacts),
            phone_work: check_contacts_data("Рабочий", item.contacts),
            phone_mobile: check_contacts_data("Мобильный", item.contacts),
            skype: check_contacts_data("Skype", item.contacts),
            icq: check_contacts_data("ICQ", item.contacts),
        });
    });
    this.exportCSVFile(headers, itemsFormatted, fileTitle);
}

// Получение данных
async function get_table(id,url) {
    var vals = [];
    var sel = document.querySelector("#" + id + "");
    for (var i = 0, n = sel.options.length; i < n; i++) {
        if (sel.options[i].value && sel.options[i].text) vals.push([sel.options[i].value, sel.options[i].text]);
    }
    
    for (var j = 0; j < vals.length; j++) {
        let company_data = vals[j][1];     
        let response = await fetch(url+"/company-info/api/partner/" + vals[j][0] + "/users/");    
        let data = await response.json();
        if (data.length > 0) {
                for(i=0; i < data.length; i++){
                    data[i]['company'] = company_data;
                    items.push(data[i]);
                }
        }
    }
 format_data();
}



get_table("__BVID__39",url='')