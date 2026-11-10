from flask import Flask, render_template
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'pluspc-secret-key-2024'


# ===== ОСНОВНЫЕ МАРШРУТЫ =====
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services')
def services():
    return render_template('services.html')


@app.route('/privacy-policy')
def privacy_policy():
    """Страница политики конфиденциальности"""
    return render_template('privacy_policy.html')


@app.route('/cookie-policy')
def cookie_policy():
    """Страница политики использования файлов cookie"""
    return render_template('cookie_policy.html')


# ===== HEALTH CHECK ДЛЯ ПЛАТФОРМЫ =====
# Этот маршрут нужен Timeweb Cloud для проверки работоспособности приложения
@app.route('/health')
def health_check():
    return 'OK', 200


# ===== ЗАПУСК (только для локальной разработки) =====
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 