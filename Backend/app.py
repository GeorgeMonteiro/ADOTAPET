from flask import Flask, request, jsonify
from flask_cors import CORS
from db import criar_tabela
from usuarios import criar_usuario, buscar_usuario_por_email
import psycopg2
import bcrypt

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

    # valida campos vazios
    if not email or not senha:
        return jsonify({
            "erro": "Email e senha são obrigatórios"
        }), 400

    try:

        # busca usuário pelo email
        usuario = buscar_usuario_por_email(email)

        # usuário não encontrado
        if not usuario:
            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        # senha criptografada do banco
        senha_hash = usuario[3]

        # compara senha digitada com hash
        senha_correta = bcrypt.checkpw(
            senha.encode("utf-8"),
            senha_hash.encode("utf-8")
        )

        # login válido
        if senha_correta:

            return jsonify({
                "mensagem": "Login realizado com sucesso!",
                "usuario": {
                    "id": usuario[0],
                    "nome": usuario[1],
                    "email": usuario[2]
                }
            }), 200

        # senha errada
        else:

            return jsonify({
                "erro": "Senha incorreta"
            }), 401

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)