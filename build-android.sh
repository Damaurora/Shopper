#!/bin/bash

# 1. Сборка React приложения
echo "===== Шаг 1: Сборка React приложения ====="
npx react-scripts build

if [ $? -ne 0 ]; then
  echo "Ошибка при сборке React приложения"
  exit 1
fi

# 2. Синхронизация с Android проектом
echo "===== Шаг 2: Синхронизация с Android проектом ====="
npx cap sync android

if [ $? -ne 0 ]; then
  echo "Ошибка при синхронизации с Android проектом"
  exit 1
fi

echo "===== Сборка для Android завершена успешно ====="
echo "Теперь вы можете собрать APK файлы для разных архитектур:"
echo "cd android && ./build-apk-types.sh"