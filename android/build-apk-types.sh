#!/bin/bash

# Скрипт для сборки APK файлов для разных архитектур процессора

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Сборка APK файлов для разных архитектур =====${NC}"

# Убедимся, что директория для APK существует
mkdir -p ../apk-output

# Архитектуры, для которых мы будем собирать APK
ARCHS=("armeabi-v7a" "arm64-v8a" "x86" "x86_64")

# Сборка для каждой архитектуры
for arch in "${ARCHS[@]}"; do
    echo -e "${YELLOW}1. Сборка для ${arch}${NC}"
    
    # Модифицируем build.gradle для указания только одной архитектуры
    if [ -f app/build.gradle ]; then
        # Сохраняем оригинальный файл
        cp app/build.gradle app/build.gradle.bak
        
        # Заменяем на нужную архитектуру
        sed -i "s/abiFilters.*/abiFilters '${arch}'/g" app/build.gradle
        
        # Запускаем сборку
        ./gradlew assembleDebug
        
        if [ $? -eq 0 ]; then
            # Копируем APK с соответствующим именем
            if [ -f app/build/outputs/apk/debug/app-debug.apk ]; then
                cp app/build/outputs/apk/debug/app-debug.apk ../apk-output/SmartBasket-${arch}.apk
                echo -e "${GREEN}APK для ${arch} успешно собран и скопирован в apk-output/SmartBasket-${arch}.apk${NC}"
            else
                echo -e "${RED}APK файл не найден после сборки для ${arch}${NC}"
            fi
        else
            echo -e "${RED}Ошибка при сборке для ${arch}${NC}"
        fi
        
        # Восстанавливаем оригинальный файл
        mv app/build.gradle.bak app/build.gradle
    else
        echo -e "${RED}Файл app/build.gradle не найден${NC}"
        exit 1
    fi
done

# Восстанавливаем полную поддержку архитектур в build.gradle
if [ -f app/build.gradle ]; then
    sed -i "s/abiFilters.*/abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'/g" app/build.gradle
fi

echo -e "${GREEN}===== Сборка завершена =====${NC}"
echo "Файлы APK доступны в директории apk-output:"
ls -la ../apk-output/