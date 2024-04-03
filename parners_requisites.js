// Получение текущих значений связок
// Команда 1
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);

// Команда 2
jq.src = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";

// Команда 3
function checkUndefined(value) {
    if (typeof value === 'undefined'){ 
        return ''; 
    }
    else {    
        return value;
    }
}

// Команда 4
var fieldset_get = $('fieldset.djn-module'); 
var data=[]
for (const [key, value] of Object.entries(fieldset_get)) { 
        var contract_number = $(value).find('.field-contract_number > input').attr('value')
        var field_contract_date = $(value).find('.field-contract_date > p > input').attr('value')
        var field_contract_date_end = $(value).find('.field-contract_complete_date > p > input').attr('value')
        var selection = $(value).find('.select2-hidden-accessible')
        var select_data=selection.find(':selected')
        try {
            if(isNaN(key)==false){
                data.push(
                    {"text":checkUndefined(select_data[0].innerText),
                    "contract_number":checkUndefined(contract_number),
                    "id":checkUndefined(select_data[0].attributes.value.value),
                    "field_contract_date":checkUndefined(field_contract_date),
                    "field_contract_date_end":checkUndefined(field_contract_date_end),
                    })
             }
            } catch (error) {
            }
}
console.log(data)
// После данного этапа неоьходимо скопировать содержимое обьекта и
// и сохранить в переменной data



// Установка значений в новую связку
// Команда 1
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);

// Команда 2
jq.src = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";

// Команда 3
// Данный этап может выполняться длительное время для 70 значений 5 минут
// На этом этапе система нажимает кнопку Добавить еще один Реквизиты-Партнёры
// и новые формы генериуруются почему-то очень долго, при этом руками быстро
for (value_sourse of data) {
    $('.add-row > a.add-handler')[0].click()
}

// Команда 4
var fieldset_set = $('fieldset.djn-module');
item=0
for (const [key, value] of Object.entries(fieldset_set)) {
    try {
        $(value).find('.field-contract_number > input').val(data[item].contract_number)
        $(value).find('.field-contract_date > p >input').val(data[item].field_contract_date)
        $(value).find('.field-contract_complete_date > p >input').val(data[item].field_contract_date_end)
        var selection = $(value).find('.select2-hidden-accessible')
        var newOption = new Option(data[item].text, data[item].id, true, true);
        $('#'+selection[0].id).append(newOption).trigger('change');
    } catch (e) {
        console.log(e)
    }
    item+=1
}



