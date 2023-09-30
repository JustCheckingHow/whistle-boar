from flask import Flask
import os
from logging import getLogger, INFO
from celery import Celery

app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")

gunicorn_logger = getLogger('gunicorn.error')
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(INFO)

def make_celery(app):
    celery = Celery(app.import_name)
    celery.conf.update(CELERY_CONFIG={
        'broker_url': 'redis://localhost:6379',
        'result_backend': 'redis://localhost:6379',
    })

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(app)
