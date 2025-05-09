# Упрощенное руководство по сборке APK

Это руководство поможет получить готовый APK файл для установки на Android устройство.

## Метод 1: Использование GitHub Actions (рекомендуется)

### Настройка сборки на GitHub:

1. Создайте или войдите в аккаунт GitHub
2. Создайте новый публичный репозиторий на GitHub
3. Загрузите все файлы проекта в репозиторий
4. Перейдите на вкладку "Actions" в репозитории
5. Нажмите кнопку "Run workflow" напротив "Android Build"
6. Дождитесь окончания сборки (обычно занимает 10-15 минут)
7. После завершения сборки откройте выполненный workflow
8. В разделе "Logs" вы увидите сообщение о созданных APK файлах
9. Скачайте файлы через интерфейс GitHub

### Решение проблем с GitHub Actions:

Если при сборке возникают ошибки:
1. Убедитесь, что в репозитории есть файл `.github/workflows/android-build.yml`
2. Попробуйте форкнуть существующий репозиторий, где уже настроена сборка
3. Используйте сборку через облачную IDE или ищите готовые APK

## Метод 2: Локальная сборка на компьютере

Для сборки необходим компьютер с установленным:
- Node.js 16 или новее
- Java JDK 11
- Android SDK (можно установить через Android Studio)

Шаги сборки:
1. Клонируйте репозиторий:
   ```
   git clone https://github.com/ваш-аккаунт/ваш-репозиторий.git
   cd ваш-репозиторий
   ```
2. Установите зависимости:
   ```
   npm install
   npm install -g @capacitor/cli
   ```
3. Запустите скрипт сборки:
   ```
   ./build-apk.sh
   ```
4. Готовый APK будет в папке `apk-output/`

## Метод 3: Использование готовых APK файлов

Если у вас нет возможности собрать APK:
1. Попросите владельца репозитория предоставить вам собранный APK файл
2. Скачайте APK из раздела Releases на GitHub, если он там есть
3. Скачайте последнюю версию APK из облачных хранилищ

## Выбор подходящего APK

- **SmartBasket-arm64-v8a.apk**: для большинства современных устройств (с 2018 года)
- **SmartBasket-armeabi-v7a.apk**: для старых устройств
- **SmartBasket-universal.apk**: для любых устройств (самый большой размер)

## Установка APK на устройство

1. Передайте APK файл на устройство через мессенджер или облачное хранилище
2. Нажмите на файл и выберите "Установить"
3. Если появится предупреждение о ненадежном источнике, нажмите "Настройки" и разрешите установку из этого источника
4. Завершите установку и запустите приложение

## Важно знать

- APK файлы, полученные через GitHub Actions, не подписаны и являются debug-версиями
- Для публикации в Google Play необходимо дополнительно подписать APK ключом
- Проект настроен для русскоязычного интерфейса и оптимизирован под темную тему