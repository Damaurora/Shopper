#!/bin/bash

echo "===== Шаг 1: Сборка React приложения ====="
npx react-scripts build

echo "===== Шаг 2: Синхронизация с Android проектом ====="
npx cap sync android

echo "===== Шаг 3: Сборка универсального APK ====="
cd android

# Выдаем права на Gradle
chmod +x ./gradlew

# Модифицируем build.gradle для включения всех архитектур
sed -i "s/abiFilters.*/abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'/g" app/build.gradle

# Собираем APK
./gradlew assembleDebug

# Копируем APK в выходную директорию
cd ..
mkdir -p apk-output
cp android/app/build/outputs/apk/debug/app-debug.apk apk-output/SmartBasket-universal.apk

echo "===== Сборка завершена ====="
echo "APK файл готов: apk-output/SmartBasket-universal.apk"