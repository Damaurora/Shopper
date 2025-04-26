/**
 * Рекомендательная система для анализа прошлых списков покупок
 * и рекомендации товаров для будущих списков.
 * 
 * Система работает в двух режимах:
 * 1. Офлайн-режим с базовым алгоритмом на основе частоты и совместной встречаемости
 * 2. Онлайн-режим с использованием OpenAI для более точных рекомендаций
 */

// Импортируем библиотеку OpenAI
let OpenAI;
try {
  OpenAI = require('openai').default;
} catch (error) {
  console.log('OpenAI не загружен. Используем только офлайн-режим.');
}

// Определение сезонов для контекстных рекомендаций
const getSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'весна';
  if (month >= 5 && month <= 7) return 'лето';
  if (month >= 8 && month <= 10) return 'осень';
  return 'зима';
};

// Проверка доступности API OpenAI
const checkOpenAIAvailability = async () => {
  if (!OpenAI) return false;
  
  try {
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || window.OPENAI_API_KEY
    });
    
    if (!openai.apiKey) return false;
    
    // Проверка подключения к интернету
    const isOnline = navigator.onLine;
    if (!isOnline) return false;
    
    return true;
  } catch (error) {
    console.log('Ошибка при проверке доступности OpenAI:', error);
    return false;
  }
};

// Calculate item frequency across all lists
const calculateItemFrequency = (lists) => {
  const frequencies = {};
  
  lists.forEach(list => {
    // Get unique items in this list
    const uniqueItems = new Set(list.items.map(item => item.name.toLowerCase()));
    
    // Increment frequency for each unique item
    uniqueItems.forEach(itemName => {
      frequencies[itemName] = (frequencies[itemName] || 0) + 1;
    });
  });
  
  return frequencies;
};

// Calculate co-occurrence between items
const calculateCoOccurrences = (lists) => {
  const coOccurrences = {};
  
  lists.forEach(list => {
    // Get unique items in this list
    const items = list.items.map(item => item.name.toLowerCase());
    
    // For each unique pair of items
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        // Ensure consistent ordering of item pairs
        const [item1, item2] = [items[i], items[j]].sort();
        
        // Create key for this pair
        const pairKey = `${item1}|${item2}`;
        
        // Increment count
        coOccurrences[pairKey] = (coOccurrences[pairKey] || 0) + 1;
      }
    }
  });
  
  return coOccurrences;
};

// Получение рекомендаций в офлайн-режиме
const getOfflineRecommendations = (recentLists) => {
  if (!recentLists || recentLists.length === 0) {
    // Если нет списков, возвращаем базовые продукты
    return [
      { id: `rec_${Date.now()}_1`, name: 'Хлеб', confidence: 0.95 },
      { id: `rec_${Date.now()}_2`, name: 'Молоко', confidence: 0.92 },
      { id: `rec_${Date.now()}_3`, name: 'Яйца', confidence: 0.88 },
      { id: `rec_${Date.now()}_4`, name: 'Помидоры', confidence: 0.85 },
      { id: `rec_${Date.now()}_5`, name: 'Огурцы', confidence: 0.82 },
    ];
  }
  
  // Calculate item frequencies
  const frequencies = calculateItemFrequency(recentLists);
  
  // Calculate co-occurrences
  const coOccurrences = calculateCoOccurrences(recentLists);
  
  // Get list of all unique items
  const allItems = Object.keys(frequencies);
  
  // Calculate total number of lists
  const totalLists = recentLists.length;
  
  // Calculate recommendation scores
  const recommendations = allItems.map(itemName => {
    // Base score from frequency (percentage of lists containing this item)
    const frequencyScore = frequencies[itemName] / totalLists;
    
    // Co-occurrence bonus (if items often appear together)
    let coOccurrenceScore = 0;
    
    allItems.forEach(otherItem => {
      if (itemName !== otherItem) {
        const [item1, item2] = [itemName, otherItem].sort();
        const pairKey = `${item1}|${item2}`;
        
        if (coOccurrences[pairKey]) {
          coOccurrenceScore += coOccurrences[pairKey] / totalLists;
        }
      }
    });
    
    // Normalize co-occurrence score
    coOccurrenceScore = coOccurrenceScore / allItems.length;
    
    // Сезонный бонус
    let seasonalBonus = 0;
    const season = getSeason();
    const seasonalItems = {
      весна: ['зелень', 'редис', 'спаржа', 'ягоды'],
      лето: ['арбуз', 'дыня', 'персики', 'мороженое', 'окрошка'],
      осень: ['тыква', 'яблоки', 'груши', 'грибы'],
      зима: ['мандарины', 'шоколад', 'какао', 'корица']
    };
    
    if (seasonalItems[season].some(item => itemName.includes(item))) {
      seasonalBonus = 0.2;
    }
    
    // Final score (weighted combination)
    const finalScore = (frequencyScore * 0.6) + (coOccurrenceScore * 0.25) + seasonalBonus;
    
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: itemName.charAt(0).toUpperCase() + itemName.slice(1), // Capitalize first letter
      confidence: Math.min(finalScore, 0.99) // Cap at 0.99
    };
  });
  
  // Sort by confidence score (descending) and take top 15
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 15);
};

// Получение рекомендаций с использованием OpenAI
const getAIRecommendations = async (recentLists, currentItems = []) => {
  try {
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || window.OPENAI_API_KEY
    });
    
    // Формируем контекст из последних списков
    let listsContext = '';
    if (recentLists && recentLists.length > 0) {
      listsContext = 'Вот мои последние списки покупок:\n';
      
      // Берём не более 5 последних списков для контекста
      const lastLists = recentLists.slice(-5);
      lastLists.forEach((list, index) => {
        listsContext += `Список ${index + 1}: ${list.items.map(item => item.name).join(', ')}\n`;
      });
    }
    
    // Учитываем текущие товары в списке
    let currentListContext = '';
    if (currentItems && currentItems.length > 0) {
      currentListContext = `Сейчас в моём списке уже есть: ${currentItems.join(', ')}\n`;
    }

    // Информация о сезоне
    const seasonContext = `Сейчас ${getSeason()}.`;
    
    // Формируем полный запрос
    const prompt = `
${listsContext}
${currentListContext}
${seasonContext}

Пожалуйста, порекомендуй мне 10 товаров для покупки на основе моей истории покупок и текущего сезона. 
Верни результат в формате JSON в виде массива объектов с полями "name" и "confidence" (от 0 до 1). 
Например: [{"name": "Молоко", "confidence": 0.95}, {"name": "Хлеб", "confidence": 0.92}]
`;

    // Отправляем запрос к OpenAI
    // самая новая модель OpenAI - "gpt-4o", выпущенная 13 мая 2024. Не меняйте на другую модель без явного указания пользователя
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Ты ассистент, который помогает составлять списки покупок на основе анализа предыдущих покупок пользователя." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Обрабатываем ответ
    const content = response.choices[0].message.content;
    const aiRecommendations = JSON.parse(content);
    
    // Преобразуем в нужный формат и добавляем ID
    return aiRecommendations.map(rec => ({
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: rec.name,
      confidence: rec.confidence,
      aiGenerated: true
    }));
    
  } catch (error) {
    console.error('Ошибка при получении рекомендаций от OpenAI:', error);
    // Возвращаем офлайн рекомендации в случае ошибки
    return getOfflineRecommendations(recentLists);
  }
};

// Get recommended items based on a user's past lists
export const getRecommendedItems = async (completedLists, currentItems = []) => {
  // Только списки за последние 90 дней для релевантности
  const now = new Date();
  const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
  
  let recentLists = [];
  if (completedLists && completedLists.length > 0) {
    recentLists = completedLists.filter(list => 
      new Date(list.completedAt) >= ninetyDaysAgo
    );
    
    if (recentLists.length === 0) {
      // Если нет недавних списков, используем все
      recentLists = completedLists;
    }
  }
  
  // Проверяем доступность OpenAI API
  const isOpenAIAvailable = await checkOpenAIAvailability();
  
  if (isOpenAIAvailable) {
    try {
      // Получаем рекомендации с использованием AI
      console.log('Используем AI рекомендации');
      return await getAIRecommendations(recentLists, currentItems);
    } catch (error) {
      console.error('Ошибка при использовании AI рекомендаций:', error);
      // Используем офлайн рекомендации в случае ошибки
      console.log('Переключаемся на офлайн рекомендации');
      return getOfflineRecommendations(recentLists);
    }
  } else {
    // Используем офлайн рекомендации
    console.log('Используем офлайн рекомендации');
    return getOfflineRecommendations(recentLists);
  }
};

// Export for testing
export const __test__ = {
  calculateItemFrequency,
  calculateCoOccurrences,
  getOfflineRecommendations,
  checkOpenAIAvailability
};
