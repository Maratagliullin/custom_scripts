
// Тип ТС
let truck_kinds = store.state.prices.form_price_list_item.fields.truck_kinds.options

// Вид ТС
let truck_mode = store.state.prices.form_price_list_item.fields.truck_mode.options

// Список доступных контрагентов
let counteragents = store.state.prices.form_carrier_price_settings.fields.carrier.options

// Идентфикатор прайс-листа
let price_lists =  store.state.prices.price_lists[0].id


// Замена символьных значений Перевозчика Вида ТС и Типа ТС на идентификаторы
function transformData(data, truckModes, truckKinds, counteragents) {
    // Создаем мапы для быстрого поиска по текстовым значениям
    const truckModeMap = Object.fromEntries(truckModes.map(item => [item.text, item.value]));
    const truckKindMap = Object.fromEntries(truckKinds.map(item => [item.text, item.value]));
    const counteragentMap = Object.fromEntries(counteragents.map(item => [item.text, item.value]));

    // Преобразуем данные
    return data.map(entry => {
        const { origins, destinations } = entry;

        // Преобразование truck_mode
        const transformedTruckMode = truckModeMap[entry.truck_mode];
        if (transformedTruckMode === undefined) {
            console.warn(`Маппинг не состоялся для truck_mode: "${entry.truck_mode}" (origins: ${origins}, destinations: ${destinations})`);
        }

        // Преобразование truck_kinds
        const transformedTruckKinds = entry.truck_kinds.map(kind => {
            const transformedKind = truckKindMap[kind];
            if (transformedKind === undefined) {
                console.warn(`Маппинг не состоялся для truck_kind: "${kind}" (origins: ${origins}, destinations: ${destinations})`);
            }
            return transformedKind;
        }).filter(kindValue => kindValue !== undefined);

        // Преобразование price.carrier
        const transformedPrices = entry.price.map(priceEntry => {
            const transformedCarrier = counteragentMap[priceEntry.carrier];
            if (transformedCarrier === undefined) {
                console.warn(`Маппинг не состоялся для carrier: "${priceEntry.carrier}" (origins: ${origins}, destinations: ${destinations})`);
            }
            return {
                ...priceEntry,
                carrier: transformedCarrier || priceEntry.carrier
            };
        });

        return {
            ...entry,
            truck_mode: transformedTruckMode || entry.truck_mode,
            truck_kinds: transformedTruckKinds,
            price: transformedPrices
        };
    });
}


// Создаем направление и цены
async function sendData(data, csrfToken, price_lists) {
    const priceListItemUrl = "/customer/api/price_list_item/";
    const priceListItemCarrierUrl = "/customer/api/price_list_item_carrier/";

    for (const item of data) {
        const { origins, destinations, truck_mode, truck_kinds, base_price, price } = item;
        const payload = {
            origins,
            destinations,
            truck_mode,
            truck_kinds,
            price_list: price_lists,
            base_price: Number(base_price),
            additional_point_price: null // Дополнительное поле с null
        };

        try {
            // Отправляем запрос к /price_list_item/
            const priceListItemResponse = await fetch(priceListItemUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Csrftoken": csrfToken // Добавляем CSRF токен в заголовки
                },
                body: JSON.stringify(payload) // Отправляем объект
            });

            if (!priceListItemResponse.ok) {
                throw new Error(`Ошибка запроса к /price_list_item/: ${priceListItemResponse.status} ${priceListItemResponse.statusText}`);
            }

            const priceListItemResult = await priceListItemResponse.json();

            // Сохраняем price_list_item ID в текущий объект
            const priceListItemId = priceListItemResult.id;
            if (priceListItemId) {
                item.price_list_item = priceListItemId;
            }

            console.log("Ответ от /price_list_item/ для", { origins, destinations }, ":", priceListItemResult);

            // Обрабатываем массив price и отправляем запросы к /price_list_item_carrier/
            for (let carrierInfo of price) {
                let carrierPayload = {
                    cost: parseInt(carrierInfo.price.replace(',', '.'), 10),
                    additional_point_price: null,
                    carrier: carrierInfo.carrier,
                    price_list_item: priceListItemId
                };

                try {
                    const carrierResponse = await fetch(priceListItemCarrierUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Csrftoken": csrftoken
                        },
                        body: JSON.stringify(carrierPayload)
                    });

                    if (!carrierResponse.ok) {
                        throw new Error(`Ошибка запроса к /price_list_item_carrier/: ${carrierResponse.status} ${carrierResponse.statusText}`);
                    }

                    const carrierResult = await carrierResponse.json();
                    console.log("Ответ от /price_list_item_carrier/ для carrier:", carrierInfo.carrier, ":", carrierResult);
                } catch (carrierError) {
                    console.error("Ошибка при отправке данных к /price_list_item_carrier/ для carrier:", carrierInfo.carrier, ":", carrierError);
                }
            }
        } catch (error) {
            console.error("Ошибка при отправке данных к /price_list_item/ для", { origins, destinations }, ":", error);
        }
    }

    console.log("Обновлённая структура данных:", data);
}


// Подготовительный этап:
// 0. Перед каждым импортом необходимо обновить csrfToken токен, информация о значении токена содержится в заголовках http-запроса и доступна через ChromeDevTools->Сеть->Заголовки
// 0. Экспортировать шаблон в csv, csv вставить в форму "Создание прайса:" в transform_data.html(идет в комплекте), 
// и нажать кнопку Преобразовать в JSON (Пример формата в transform_data.html,формат шаблона нарушать нельзя)
// О. Определить и заполнить переменную dataJSON данными из формы(Создание прайса:) в JSON формате, полученном на предыдушем этапе.Пример: dataJSON=[....] 
// 0. Скопировать код скрипта в консоль Chrome, переменные: (truck_kinds, truck_mode, counteragents, price_lists), код функций: sendData, transformData

// 1. Трансформация данных
const transformedData = transformData(dataJSON, truck_mode, truck_kinds, counteragents);
console.log(transformedData)

// 2. Запуск процедуры создания
const csrfToken=""
sendData(transformedData,csrfToken,price_lists);

// 3. Перерисовать страничку
app.$emit('bv::refresh::table', 'server-table-price-list-items')



// получение всего списка Типа ТС для заказчика для создания справочника в шаблоне
let truck_kinds_sample = store.state.prices.form_price_list_item.fields.truck_kinds.options

let kinds=''
for (item of truck_kinds_sample) {
kinds+=item.text+ '\n'
}
console.log(kinds)

// получение всего списка Вида ТС для заказчика для создания справочника в шаблоне
let truck_mode_sample = store.state.prices.form_price_list_item.fields.truck_mode.options

let mode=''
for (item of truck_mode_sample) {
mode+=item.text+ '\n'
}
console.log(mode)