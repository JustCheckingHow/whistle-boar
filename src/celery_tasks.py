from celery import Celery
from app import app
import time
import os
from dotenv import load_dotenv
import openai.error

load_dotenv()

MODELS = {
    # "information_extraction": "ft:gpt-3.5-turbo-0613:flathub::83Q0lAVq"
    # "information_extraction": "ft:gpt-3.5-turbo-0613:flathub::847grKqj"
    "information_extraction": "ft:gpt-3.5-turbo-0613:flathub::83nRdE5E"
}

def make_celery(app):
    celery = Celery(app.import_name,
                    backend='redis://redis_chatter:6379',
                    broker='redis://redis_chatter:6379')
    
    # celery.conf.update(CELERY_CONFIG={
    #     'broker_url': 'redis://redis_chatter:6379',
    #     'result_backend': 'redis://redis_chatter:6379'
    # })

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(app)
