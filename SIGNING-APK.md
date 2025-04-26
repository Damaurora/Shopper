# Руководство по подписыванию APK

Данное руководство поможет подписать APK файл для публикации в Google Play Store или для доверенного распространения.

## Зачем подписывать APK?

1. **Безопасность** - подпись гарантирует, что APK не был изменен после создания
2. **Обновления** - только приложения с одинаковой подписью могут обновлять друг друга
3. **Доверие** - Google Play и устройства Android проверяют подпись перед установкой
4. **Публикация** - Google Play требует, чтобы все приложения были подписаны

## Метод 1: Ручное подписывание APK

### Шаг 1: Создание ключа подписи

```bash
keytool -genkey -v -keystore smartbasket.keystore -alias smartbasket -keyalg RSA -keysize 2048 -validity 10000
```

При выполнении команды вам нужно будет ввести:
- Пароль для хранилища ключей
- Ваше имя, организацию, город, регион, страну
- Пароль для ключа (можно использовать тот же, что и для хранилища)

**ВАЖНО**: Надежно сохраните файл `smartbasket.keystore` и пароли! Потеря этих данных означает невозможность обновления приложения в будущем.

### Шаг 2: Подписывание APK

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore smartbasket.keystore app-debug.apk smartbasket
```

Где:
- `smartbasket.keystore` - созданное вами хранилище ключей
- `app-debug.apk` - исходный APK файл
- `smartbasket` - псевдоним ключа, указанный при создании

### Шаг 3: Оптимизация APK

```bash
zipalign -v 4 app-debug.apk SmartBasket-signed.apk
```

Теперь у вас есть подписанный и оптимизированный APK файл `SmartBasket-signed.apk`.

## Метод 2: Настройка подписывания в build.gradle

Этот метод позволяет автоматически подписывать APK при сборке.

### Шаг 1: Создайте ключ подписи

Выполните шаг 1 из первого метода, чтобы создать файл `.keystore`.

### Шаг 2: Создайте файл конфигурации

Создайте файл `keystore.properties` в корневой директории проекта:

```
storeFile=путь/к/smartbasket.keystore
storePassword=пароль_хранилища
keyAlias=smartbasket
keyPassword=пароль_ключа
```

### Шаг 3: Настройте build.gradle

Отредактируйте файл `android/app/build.gradle`, добавив:

```groovy
def keystorePropertiesFile = rootProject.file("../keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    // ... существующий код
    
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... другие настройки
        }
    }
}
```

### Шаг 4: Соберите подписанный APK

```bash
cd android
./gradlew assembleRelease
```

Подписанный APK будет находиться в `android/app/build/outputs/apk/release/app-release.apk`.

## Метод 3: Подписывание через Android Studio

Если у вас есть доступ к Android Studio:

1. Откройте проект в Android Studio
2. Выберите Build → Generate Signed Bundle/APK
3. Выберите APK
4. Настройте или выберите существующий ключ подписи
5. Выберите целевую директорию для подписанного APK
6. Нажмите Finish

## Проверка подписи APK

Чтобы убедиться, что APK правильно подписан:

```bash
jarsigner -verify -verbose -certs SmartBasket-signed.apk
```

Вы должны увидеть сообщение "jar verified".

## Примечания по безопасности

1. **Никогда** не включайте файл keystore.properties или .keystore в репозиторий
2. Добавьте их в .gitignore
3. Храните файлы ключей и пароли в безопасном месте (например, в менеджере паролей)
4. Рассмотрите возможность создания резервных копий ключа подписи на внешние носители

## Публикация в Google Play

После подписания APK вы можете загрузить его в Google Play Console:

1. Зарегистрируйтесь как разработчик (оплата 25$, однократно)
2. Создайте новое приложение
3. Загрузите подписанный APK в разделе "Релизы"
4. Заполните все необходимые метаданные (описание, скриншоты и т.д.)
5. Отправьте на проверку (занимает обычно 1-3 дня)