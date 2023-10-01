from elasticsearch import Elasticsearch
from typing import List

INDEX = 'courses'


def create_es_instance() -> Elasticsearch:
    es = Elasticsearch(hosts=[f"http://206.189.56.21:9200"])
    return es


def simple_query(es: Elasticsearch, query_input: List[str]):
    query = {
        'query': {
            'query_string': {
                'query': " OR ".join([f"({q})" for q in query_input]),
                "fields": ["course"]
            }
        },
        "highlight": {
            "fields": {
                "course": {}
            }
        },  # highlight here
    }

    results = es.search(index=INDEX, body=query)
    return results["hits"]["hits"]
