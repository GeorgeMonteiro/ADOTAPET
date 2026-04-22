from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def conectar_db():
    return psycopg2.connect(
        host="localhost",
        database="adotapet",
        user="meuusuario",
        password="123456",
        port="5432"
    )

def criar_tabela():
    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

criar_tabela()

@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.json

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")

    if not nome or not email or not senha:
        return jsonify({"erro": "Campos obrigatórios"}), 400

    try:
        conn = conectar_db()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
            (nome, email, senha)
)

        conn.commit()
        conn.close()

        return jsonify({"mensagem": "Cadastro realizado com sucesso!"})

    except sqlite3.IntegrityError:
        return jsonify({"erro": "Email já cadastrado"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001)