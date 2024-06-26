### Клиентская часть проекта для хакатона Лидеры цифровой трансформации

Этот репозиторий содержит настройки для запуска фронтенд-приложения с использованием Docker Compose.

### Включенные сервисы

- **app**: Контейнер с фронтенд-приложением, запущенным в Docker.

### Использование

#### Предварительные требования

- Установленный Docker на вашем компьютере.
- Установленный Docker Compose на вашем компьютере.

#### Установка

1. Склонируйте репозиторий:
   ```
   git clone <repository_url>
   cd <repository_directory>
   ```

2. Запустите Docker Compose:
   ```
   docker-compose up -d
   ```

   Эта команда запускает фронтенд-приложение в режиме, который позволяет ему работать в фоновом режиме (`-d`).

#### Доступ к приложению

- Фронтенд-приложение становится доступным по адресу `http://localhost:8080`.

#### Настройка

- При необходимости измените порты или переменные окружения в файле `docker-compose.yaml`.
- Убедитесь, что тома (`front_vol` в данном случае) правильно настроены для зависимостей вашего приложения.

### Контакты

По вопросам или поддержке обращайтесь на [email@example.com].