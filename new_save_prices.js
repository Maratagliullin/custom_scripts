async function fetchPriceListItems() {
    try {
        const pageSize = 25; // Размер страницы (по умолчанию 25)
        let allResults = []; // Массив для хранения всех результатов
        let currentPage = 1; // Начальная страница
        let totalPages = 1;  // Общее количество страниц

        // Первая загрузка для получения общего количества
        const initialResponse = await fetch(`/customer/api/price_list_item?page=${currentPage}&size=${pageSize}`);
        if (!initialResponse.ok) throw new Error(`Failed to fetch price list items: ${initialResponse.statusText}`);

        const initialData = await initialResponse.json();
        if (!initialData.results || !Array.isArray(initialData.results)) {
            throw new Error('Invalid data format received from price list item API.');
        }

        allResults.push(...initialData.results);
        totalPages = Math.ceil(initialData.count / pageSize); // Рассчитываем общее количество страниц

        // Загружаем данные по страницам с ограничением количества одновременных запросов
        const MAX_CONCURRENT_REQUESTS = 5; // Лимит одновременных запросов
        async function fetchWithLimit(pages) {
            const results = [];
            for (let i = 0; i < pages.length; i += MAX_CONCURRENT_REQUESTS) {
                const batch = pages.slice(i, i + MAX_CONCURRENT_REQUESTS);
                const responses = await Promise.all(
                    batch.map(page =>
                        fetch(`/customer/api/price_list_item?page=${page}&size=${pageSize}`)
                            .then(async (response) => {
                                if (!response.ok) throw new Error(`Failed to fetch page ${page}: ${response.statusText}`);
                                const pageData = await response.json();
                                if (!pageData.results || !Array.isArray(pageData.results)) {
                                    throw new Error(`Invalid data format on page ${page}.`);
                                }
                                return pageData.results;
                            })
                    )
                );
                responses.forEach(res => results.push(...res));
            }
            return results;
        }

        const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2); // Страницы начиная со 2
        const additionalResults = await fetchWithLimit(pages);
        allResults.push(...additionalResults);

        // Обогащаем данные перевозчиками с ограничением одновременных запросов
        const enrichedResults = await fetchWithLimitForCarriers(allResults);

        // Обновляем результаты
        const enrichedData = {
            count: initialData.count,
            results: enrichedResults,
        };

        console.log('Enriched Data:', JSON.stringify(enrichedData, null, 2));
        return enrichedData;
    } catch (error) {
        console.error('Error fetching price list items:', error);
        return null;
    }
}

// Ограничение запросов для обогащения перевозчиками
async function fetchWithLimitForCarriers(items) {
    const MAX_CONCURRENT_REQUESTS = 5; // Лимит одновременных запросов
    const enrichedItems = [];

    for (let i = 0; i < items.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = items.slice(i, i + MAX_CONCURRENT_REQUESTS);

        const responses = await Promise.all(
            batch.map(async (item) => {
                try {
                    const carrierResponse = await fetch(`/customer/api/price_list_item_carrier/?price_list_item=${item.id}`);
                    if (!carrierResponse.ok) throw new Error(`Failed to fetch carriers for item ${item.id}: ${carrierResponse.statusText}`);

                    const carrierData = await carrierResponse.json();
                    item.carrier = carrierData;
                } catch (error) {
                    console.error(`Error processing item ${item.id}:`, error);
                    item.carrier = [];
                }
                return item;
            })
        );

        enrichedItems.push(...responses);
    }

    return enrichedItems;
}

function downloadCSV(data) {
    const rows = [];

    // Заголовок CSV
    rows.push('origins;destinations;truck_kinds_display;truck_mode_display;base_price;carrier_name;cost');

    // Проходим по results
    data.results.forEach(item => {
        if (item.carrier && item.carrier.length > 0) {
            // Если есть данные о перевозчиках
            item.carrier.forEach(carrier => {
                const row = [
                    item.origins,                                     // origins
                    item.destinations,                                // destinations
                    `'${item.truck_kinds_display.join("','")}'`,      // truck_kinds_display
                    item.truck_mode_display,                          // truck_mode_display
                    item.base_price !== null ? item.base_price : '',  // base_price
                    carrier.carrier_name,                             // carrier_name
                    carrier.cost                                      // cost
                ].join(';');
                rows.push(row);
            });
        } else {
            // Если данных о перевозчиках нет
            const row = [
                item.origins,                                     // origins
                item.destinations,                                // destinations
                `'${item.truck_kinds_display.join("','")}'`,      // truck_kinds_display
                item.truck_mode_display,                          // truck_mode_display
                item.base_price !== null ? item.base_price : '',  // base_price
                '',                                               // carrier_name (пусто)
                ''                                                // cost (пусто)
            ].join(';');
            rows.push(row);
        }
    });

    // Преобразуем массив строк в CSV
    const csvContent = rows.join('\n');

    // Создаем ссылку для скачивания файла
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'price_list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function main() {
    const jsonData = await fetchPriceListItems();
    if (jsonData) {
        downloadCSV(jsonData);
    }
}
