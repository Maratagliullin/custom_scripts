// Получение компаний и их партнеров
// Команда 1
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);


// Команда 2
function checkUndefined(value) {
    if (typeof value === 'undefined'){ 
        return ''; 
    }
    else {    
        return value;
    }
}

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
var fileTitle = 'company_partners';
var itemsFormatted = [];
var items = [];

// Заголовки результирующего CSV
var headers = {
    field_carrier: "Перевозчик",
    field_carrier_company_name: "Переопределенное название перевозчика",
    field_is_active: "Партнерство активно",
   
};

// Формат для результирующего CSV
function format_data() {
    items.forEach((item) => {
        console.log(item);
        itemsFormatted.push({
            field_carrier: check_null(item.field_carrier),
            field_carrier_company_name: check_null(item.field_carrier_company_name),
            field_is_active: check_null(item.field_is_active),
    });
})
    this.exportCSVFile(headers, itemsFormatted, fileTitle);
}



var fieldset_get = $('fieldset.djn-module'); 
for (const [key, value] of Object.entries(fieldset_get)) { 
     try {    
        var field_carrier = $(value).find('.field-carrier > .field-carrier > p > a')[0].innerText
        var field_is_active = $(value).find('.field-is_active > .field-is_active > p > img').attr("alt")
        var field_carrier_company_name = $(value).find('.field-carrier_company_name > input').attr('value')
       
            if(isNaN(key)==false){
                items.push(
                    {"field_carrier":checkUndefined(field_carrier),
                    "field_carrier_company_name":checkUndefined(field_carrier_company_name),
                    "field_is_active":checkUndefined(field_is_active),
                    })
             }
    } catch (error) {}
}
format_data()



