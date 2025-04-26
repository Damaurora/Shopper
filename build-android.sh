#!/bin/bash

# Скрипт для сборки Android приложения

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Шаг 1: Сборка React приложения =====${NC}"
# Используем react-scripts напрямую, так как скрипта build может не быть в package.json
npx react-scripts build

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке React приложения${NC}"
    exit 1
fi

echo -e "${GREEN}===== Шаг 2: Синхронизация с Android проектом =====${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при синхронизации с Android проектом${NC}"
    exit 1
fi

echo -e "${GREEN}===== Сборка для Android завершена успешно =====${NC}"
echo "Теперь вы можете собрать APK файлы для разных архитектур:"
echo "cd android && ./build-apk-types.sh"