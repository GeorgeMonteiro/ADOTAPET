# testes/conftest.py
import os
import sys

# Descobre o caminho para a pasta "Backend" subindo um nível e entrando nela
raiz_do_projeto = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
pasta_backend = os.path.join(raiz_do_projeto, "Backend")

# Força o Python a mapear tudo o que está dentro da pasta Backend
if pasta_backend not in sys.path:
    sys.path.insert(0, pasta_backend)

# Altera o diretório de trabalho para a pasta Backend (importante para salvar as fotos na pasta uploads correta)
os.chdir(pasta_backend)

import pytest
from db import conectar_db, criar_tabela
from app import app as flask_app

@pytest.fixture(scope="session", autouse=True)
def inicializar_banco():
    """Garante que as tabelas existem antes de iniciar a sessão de testes."""
    criar_tabela()

@pytest.fixture(autouse=True)
def limpar_banco():
    """Limpa os dados de todas as tabelas ANTES de cada caso de teste."""
    conn = conectar_db()
    cursor = conn.cursor()
    cursor.execute("TRUNCATE TABLE mensagens, animais, usuarios RESTART IDENTITY CASCADE;")
    conn.commit()
    conn.close()
    yield

@pytest.fixture
def client():
    """Configura o cliente de simulação HTTP do Flask."""
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client