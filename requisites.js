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
// Проверка на пустые значение
function check_null(data) {
    if (data !== null && data !== "") {
        return data;
    } else {
        return "-";
    }
}

// Наименование итогового файла
var fileTitle = 'requizites';
var itemsFormatted = [];
var items = [];

// Заголовки результирующего CSV
var headers = {
    company: "Компания",
    short_name: "Наименование реквизита",
    inn: "ИНН",
    kpp: "КПП",
    ogrn: "ОГРН",
    legal_address: "Адрес",
    real_carrier_phone: "Телефон",
    ext_id: "Идентификатор реквизита",
};

// Формат для результирующего CSV
function format_data() {
    items.forEach((item) => {
        console.log(item);
        itemsFormatted.push({
            company: check_null(item.company),
            short_name: check_null(item.short_name),
            inn: check_null(item.inn),
            kpp: check_null(item.kpp),
            ogrn: check_null(item.ogrn),
            legal_address: check_null(item.legal_address),
            real_carrier_phone: check_null(item.real_carrier_phone),
            ext_id: check_null(item.ext_id),
    });
})
    this.exportCSVFile(headers, itemsFormatted, fileTitle);
}

// Получение данных
async function get_table(id, url) {
    var vals = [];
    var sel = document.querySelector("#" + id + "");
    for (var i = 0, n = sel.options.length; i < n; i++) {
        if (sel.options[i].value && sel.options[i].text) vals.push([sel.options[i].value, sel.options[i].text]);
    }
    
    for (var j = 0; j < vals.length; j++) {
        let company_data = vals[j][1];     
        let response = await fetch(url+"/company-info/api/partner/" + vals[j][0] + "/requisites/");
        let data = await response.json();
        if (data.length > 0) {
                for(i=0; i < data.length; i++){
                    data[i]['company'] = company_data;
                    items.push(data[i]);
                }
        }
    }
 format_data();
};

// Вызвать функцию передав селектор хранящий идентификаторы
get_table("__BVID__39",url='');