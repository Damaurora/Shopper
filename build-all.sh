#!/bin/bash

# Скрипт для полной сборки приложения - от веб-версии до APK файлов

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Начинаю полную сборку приложения СмартКорзина =====${NC}"

# 1. Проверка наличия Node.js и npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${RED}Ошибка: Node.js или npm не установлены.${NC}"
    echo "Установите Node.js (версию 16 или выше) и npm для продолжения."
    exit 1
fi

# 2. Установка зависимостей
echo -e "${YELLOW}Устанавливаю зависимости...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при установке зависимостей.${NC}"
    exit 1
fi

# 3. Сборка React приложения
echo -e "${YELLOW}Собираю React приложение...${NC}"
# Используем react-scripts напрямую, так как скрипта build может не быть в package.json
npx react-scripts build
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке React приложения.${NC}"
    exit 1
fi

# 4. Синхронизация с Android проектом
echo -e "${YELLOW}Синхронизирую с Android проектом...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при синхронизации с Android проектом.${NC}"
    exit 1
fi

# 5. Проверка наличия Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Внимание: Java не найдена. Сборка APK не может быть выполнена.${NC}"
    echo "Установите JDK (версию 11 или выше) для сборки APK файлов."
    echo -e "${YELLOW}Веб-приложение успешно собрано и готово к использованию.${NC}"
    exit 1
fi

# 6. Сборка APK файлов для разных архитектур
echo -e "${YELLOW}Собираю APK файлы для разных архитектур...${NC}"
cd android && ./build-apk-types.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке APK файлов.${NC}"
    exit 1
fi

# 7. Готово
echo -e "${GREEN}===== Сборка завершена успешно! =====${NC}"
echo "APK файлы доступны в директории apk-output"