##### Копирование 1 к 1 из одного набора кругов в другой:
```js
// Транформация данных формы в строку для переноса (текст используется как транзитный формат)
JSON.stringify(SelectBox.cache['id_circles-X-partners_to']) // где X идентификатор формы

// Транформация строки в данные формы внутри кавычек текст полученный 
// в результате исполнения предыдущей команды
var value = JSON.parse('') 

// Вставка набора в целевую форму
SelectBox.cache['id_circles-X-partners_to'] = value  // где X идентификатор формы

// Обновление/перерисовка значений внутри целевой формы для контроля успешности операции
SelectBox.redisplay('id_circles-X-partners_to') 
```

##### Формирование круга на основании документа Excel:  
Опреределить переменные:
```js 
var source = [] // содержимое массива перевозчиков из Excel документа
var from = 'id_circles-X-partners_from' // где X идентификатор формы
var to = 'id_circles-X-partners_to' // где X идентификатор формы
```
Для удобного формирования  переменной `source` (массив в терминах данных) из Excel документа в комплекте с документацией приложена html страничка (index.html), в которую необходимо скопировать данные из Excel и получить структуру и сохранить ее в переменную `source`

![alt text](https://github.com/Maratagliullin/custom_scripts/blob/main/text_to_array.png?raw=true)  

Вставить в консоль код скрипта:
```js 
function excel_to_selectbox(source, from, to ) {
    result=[]
    error=source.slice();
    for (value_sourse of source) {
        for (item of SelectBox.cache[from]) {
            if (value_sourse==item['text']){
                result.push(item)
                let index = error.indexOf(value_sourse);
                error.splice(index, 1);
            }
        }
    }
SelectBox.cache[to]=result
SelectBox.redisplay(to)
console.log("Итоговый добавленный набор партнеров в количестве ",result.length, result)
console.log("Значения не были найдены в текущих партнерах: ", error)
}
```

Вызвать скрипт на исполнение:
```js
excel_to_selectbox(source, from, to )
```

##### Копирование 1 к 1 из круга в другой круг:
```js
// записываем источник данных который мы хотим скопировать в новую форму
var source = SelectBox.cache['id_circles-X-partners_to'] 

// присваиваем скопированные значения новой форме
SelectBox.cache['id_circles-X-partners_to'] = source 

// Обновляем/перерисовываем форму для контроля результата
SelectBox.redisplay('id_circles-X-partners_to') 
```

