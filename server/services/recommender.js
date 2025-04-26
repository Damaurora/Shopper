/**
 * Серверный компонент рекомендательной системы.
 * Использует OpenAI для генерации рекомендаций на основе истории покупок.
 */

const OpenAI = require('openai');

// Кеширование сделанных API-запросов для снижения нагрузки
const CACHE_TTL = 60 * 60 * 1000; // 1 час
const recommendationCache = new Map();

/**
 * Получение рекомендаций на основе истории покупок
 * @param {Array} shoppingHistory - история списков покупок
 * @param {Array} currentItems - текущие товары в списке
 * @param {Boolean} forceRefresh - форсировать обновление кеша
 * @returns {Array} - массив рекомендаций
 */
async function getRecommendations(shoppingHistory, currentItems = [], forceRefresh = false) {
  // Если нет API ключа, возвращаем пустой массив
  if (!process.env.OPENAI_API_KEY) {
    console.log('API ключ OpenAI отсутствует');
    return [];
  }
  
  // Формируем ключ кеша
  const cacheKey = `${JSON.stringify(shoppingHistory)}_${JSON.stringify(currentItems)}`;
  
  // Проверяем кеш, если не требуется форсировать обновление
  if (!forceRefresh && recommendationCache.has(cacheKey)) {
    const cachedData = recommendationCache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_TTL) {
      console.log('Используем кешированные рекомендации');
      return cachedData.recommendations;
    }
  }
  
  try {
    // Инициализируем OpenAI API
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Формируем контекст из историй покупок
    let listsContext = '';
    if (shoppingHistory && shoppingHistory.length > 0) {
      listsContext = 'Последние списки покупок пользователя:\n';
      
      // Берём до 5 последних списков
      const lastLists = shoppingHistory.slice(-5);
      lastLists.forEach((list, index) => {
        const itemNames = list.items.map(item => item.name);
        listsContext += `Список ${index + 1}: ${itemNames.join(', ')}\n`;
      });
    }
    
    // Учитываем текущие товары в списке
    let currentListContext = '';
    if (currentItems && currentItems.length > 0) {
      currentListContext = `Текущий список покупок: ${currentItems.join(', ')}\n`;
    }
    
    // Определение сезона
    const month = new Date().getMonth();
    let season;
    if (month >= 2 && month <= 4) season = 'весна';
    else if (month >= 5 && month <= 7) season = 'лето';
    else if (month >= 8 && month <= 10) season = 'осень';
    else season = 'зима';
    
    const seasonContext = `Текущий сезон: ${season}.`;
    
    // Запрос к OpenAI
    const prompt = `
${listsContext}
${currentListContext}
${seasonContext}

На основе истории списков покупок, порекомендуй товары, которые пользователь, вероятно, захочет купить.
Учти текущий сезон и предпочтения пользователя.
Верни результат в формате JSON как массив объектов следующего вида:
[
  {
    "name": "Название товара",
    "confidence": 0.95 // число от 0 до 1, показывающее уверенность в рекомендации
  }
]

Верни только результат в формате JSON без дополнительного текста.
`;
    
    // самая новая модель OpenAI - "gpt-4o", выпущенная 13 мая 2024. Не меняйте на другую модель без явного указания пользователя
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Ты система рекомендаций для списков покупок. Твоя задача - анализировать историю покупок пользователя и рекомендовать новые товары." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });
    
    // Обрабатываем ответ
    const result = JSON.parse(response.choices[0].message.content);
    
    // Добавляем id к каждой рекомендации
    const recommendations = result.map(item => ({
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      confidence: item.confidence || 0.8,
      aiGenerated: true
    })).slice(0, 10); // Ограничиваем до 10 рекомендаций
    
    // Кешируем результат
    recommendationCache.set(cacheKey, {
      timestamp: Date.now(),
      recommendations
    });
    
    return recommendations;
    
  } catch (error) {
    console.error('Ошибка при получении рекомендаций от OpenAI:', error);
    return [];
  }
}

module.exports = {
  getRecommendations
};