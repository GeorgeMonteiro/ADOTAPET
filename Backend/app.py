from flask import Flask, request, jsonify
from flask_cors import CORS
from db import criar_tabela
from usuarios import criar_usuario, buscar_usuario_por_email
import psycopg2

app = Flask(__name__)
CORS(app)

criar_tabela()

# ===== CADASTRO =====
@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.json

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")

    if not nome or not email or not senha:
        return jsonify({"erro": "Campos obrigatórios"}), 400

    try:
        criar_usuario(nome, email, senha)
        return jsonify({"mensagem": "Cadastro realizado com sucesso!"})

    except psycopg2.errors.UniqueViolation:
        return jsonify({"erro": "Email já cadastrado"}), 400

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ===== LOGIN =====
@app.route("/login", methods=["POST"])
def login():
    dados = request.json

    email = dados.get("email")
    senha = dados.get("senha")

    try:
        usuario = buscar_usuario_por_email(email)

        if usuario:
            if usuario[3] == senha:
                return jsonify({"mensagem": "Login realizado com sucesso!"})
            else:
                return jsonify({"erro": "Senha incorreta"}), 401
        else:
            return jsonify({"erro": "Usuário não encontrado"}), 404

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)