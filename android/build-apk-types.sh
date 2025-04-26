#!/bin/bash

# Скрипт для сборки APK файлов для разных архитектур CPU
echo "===== Сборка APK файлов для разных архитектур ====="

# 1. Сборка для armeabi-v7a
echo "1. Сборка для armeabi-v7a"
./gradlew assembleDebug -PabiFilters=armeabi-v7a
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке для armeabi-v7a"
  exit 1
fi

# 2. Сборка для arm64-v8a
echo "2. Сборка для arm64-v8a"
./gradlew assembleDebug -PabiFilters=arm64-v8a
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке для arm64-v8a"
  exit 1
fi

# 3. Сборка для x86
echo "3. Сборка для x86"
./gradlew assembleDebug -PabiFilters=x86
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке для x86"
  exit 1
fi

# 4. Сборка для x86_64
echo "4. Сборка для x86_64"
./gradlew assembleDebug -PabiFilters=x86_64
if [ $? -ne 0 ]; then
  echo "Ошибка при сборке для x86_64"
  exit 1
fi

# 5. Создание директории для APK файлов
echo "5. Создание директории для APK файлов"
mkdir -p ../apk-output
if [ $? -ne 0 ]; then
  echo "Ошибка при создании директории для APK файлов"
  exit 1
fi

# 6. Копирование APK файлов
echo "6. Копирование APK файлов"
cp app/build/outputs/apk/debug/*-armeabi-v7a-debug.apk ../apk-output/SmartCart-armeabi-v7a.apk
cp app/build/outputs/apk/debug/*-arm64-v8a-debug.apk ../apk-output/SmartCart-arm64-v8a.apk
cp app/build/outputs/apk/debug/*-x86-debug.apk ../apk-output/SmartCart-x86.apk
cp app/build/outputs/apk/debug/*-x86_64-debug.apk ../apk-output/SmartCart-x86_64.apk
cp app/build/outputs/apk/debug/*-universal-debug.apk ../apk-output/SmartCart-universal.apk

echo "===== Готово! APK файлы сохранены в директории apk-output ====="
echo "Список файлов:"
ls -la ../apk-output