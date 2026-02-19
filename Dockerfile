# Базовий образ Nginx Alpine для легкого та швидкого контейнера
FROM nginx:alpine

# Видалення дефолтної конфігурації Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копіювання нашої конфігурації Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Копіювання статичних файлів додатку
COPY src/ /usr/share/nginx/html/

# Відкриття порту 80
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
