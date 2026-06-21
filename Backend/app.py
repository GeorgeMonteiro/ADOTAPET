from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
import bcrypt
import os
import base64
from uuid import uuid4

from db import criar_tabela, conectar_db
from usuarios import criar_usuario, buscar_usuario_por_email
from animais import (criar_animal,buscar_animais_usuario,buscar_animais_filtros,deletar_animal,atualizar_animal)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


criar_tabela()


# ===== UTIL: SALVAR IMAGEM BASE64 =====
def salvar_imagem_base64(base64_string):

    if not base64_string or "," not in base64_string:
        return ""

    header, encoded = base64_string.split(",", 1)

    if "jpeg" in header or "jpg" in header:
        extensao = "jpg"
    elif "png" in header:
        extensao = "png"
    else:
        extensao = "jpg"

    nome_arquivo = f"{uuid4()}.{extensao}"
    caminho = os.path.join(UPLOAD_FOLDER, nome_arquivo)

    try:
        with open(caminho, "wb") as f:
            f.write(base64.b64decode(encoded))
        return caminho
    except Exception:
        return ""


# ===================== CADASTRO =====================
@app.route("/cadastro", methods=["POST"])
def cadastro():

    dados = request.json or {}

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")

    if not nome or not email or not senha:
        return jsonify({"erro": "Campos obrigatórios"}), 400

    try:
        criar_usuario(nome, email, senha)
        return jsonify({"mensagem": "Cadastro realizado com sucesso!"}), 201

    except psycopg2.errors.UniqueViolation:
        return jsonify({"erro": "Email já cadastrado"}), 400

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ===================== LOGIN =====================
@app.route("/login", methods=["POST"])
def login():

    dados = request.json or {}

    email = dados.get("email")
    senha = dados.get("senha")

    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    try:
        usuario = buscar_usuario_por_email(email)

        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        senha_hash = usuario[3]

        if isinstance(senha_hash, str):
            senha_hash = senha_hash.encode("utf-8")

        senha_correta = bcrypt.checkpw(
            senha.encode("utf-8"),
            senha_hash
        )

        if not senha_correta:
            return jsonify({"erro": "Senha incorreta"}), 401

        return jsonify({
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2]
            }
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ===================== CADASTRO DE ANIMAL =====================
@app.route("/animais", methods=["POST"])
def cadastrar_animal():

    dados = request.json or {}

    try:
        imagem_salva = salvar_imagem_base64(dados.get("imagem_principal"))
        dados["imagem_principal"] = imagem_salva

        criar_animal(dados)

        return jsonify({"mensagem": "Animal cadastrado com sucesso!"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/meus-animais", methods=["GET"])
def meus_animais():
    email = request.args.get("email")
    if not email:
        return jsonify({"erro": "E-mail obrigatório"}), 400

    try:
        animais = buscar_animais_usuario(email)
        lista = []
        for animal in animais:
            lista.append({
                "id": animal[0],
                "species": animal[1],
                "breed": animal[2],
                "age": animal[3],
                "size": animal[4],
                "gender": animal[5],
                "location": animal[6],
                "description": animal[7],
                "imagem_principal": animal[8],
                "status": animal[9] if len(animal) > 9 else "não adotado" # <-- Mapeado aqui
            })

        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/explorar-animais", methods=["GET"])
def explorar_animais():
    especie = request.args.get("especie")
    raca = request.args.get("raca")
    porte = request.args.get("porte")
    localizacao = request.args.get("localizacao")

    try:
        animais = buscar_animais_filtros(
            especie,
            raca,
            porte,
            localizacao
        )

        from db import conectar_db
        conn = conectar_db()
        cursor = conn.cursor()

        lista = []
        for animal in animais:
            animal_id = animal[0]
            
            # Busca rápida dos dados do dono para este animal específico
            cursor.execute("SELECT dono_nome, dono_email FROM animais WHERE id = %s", (animal_id,))
            dono_info = cursor.fetchone()
            dono_nome = dono_info[0] if dono_info else "Protetor"
            dono_email = dono_info[1] if dono_info else "suporte@adotapet.com"

            status_banco = animal[9] if len(animal) > 9 else "disponível"
            if not status_banco or status_banco.lower() == "não adotado":
                status_banco = "disponível"

            lista.append({
                "id": animal_id,
                "breed": animal[1],            
                "age": animal[2],              
                "size": animal[3],             
                "gender": animal[4],           
                "location": animal[5],         
                "description": animal[6],      
                "imagem_principal": animal[7], 
                "species": animal[8],          
                "status": status_banco,
                "dono_nome": dono_nome,     # Novo campo enviado ao Front
                "dono_email": dono_email    # Novo campo enviado ao Front
            })

        conn.close()
        return jsonify(lista), 200

    except Exception as e:
        if 'conn' in locals() and not conn.closed: conn.close()
        return jsonify({"erro": str(e)}), 500
    
# ===================== DELETAR ANIMAL =====================
@app.route("/animais/<int:id>", methods=["DELETE"])
def remover_animal(id):

    try:
        resultado = deletar_animal(id)

        if not resultado:
            return jsonify({"erro": "Animal não encontrado"}), 404

        return jsonify({"mensagem": "Animal removido com sucesso!"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ===================== EDITAR ANIMAL =====================
@app.route("/animais/<int:id>", methods=["PUT"])
def editar_animal(id):

    dados = request.json or {}

    try:
        resultado = atualizar_animal(id, dados)

        if not resultado:
            return jsonify({"erro": "Animal não encontrado"}), 404

        return jsonify({"mensagem": "Animal atualizado com sucesso!"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# ===================== UPLOAD DE ARQUIVOS =====================
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# =====================================================================
# ======================== ROTAS DE CHAT E MENSAGENS ===================
# =====================================================================

@app.route("/chat/enviar", methods=["POST"])
def enviar_mensagem():
    dados = request.get_json()
    
    # Captura os dados enviados pelo JavaScript
    animal_id = dados.get("animal_id")
    remetente_email = dados.get("remetente_email")
    destinatario_email = dados.get("destinatario_email")
    conteudo = dados.get("conteudo")

    # Validação simples
    if not remetente_email or not destinatario_email or not conteudo:
        return jsonify({"erro": "Dados obrigatórios ausentes"}), 400

    try:
        conn = conectar_db()
        cursor = conn.cursor()

        # Executa o comando de inserção no banco de dados
        cursor.execute("""
            INSERT INTO mensagens (animal_id, remetente_email, destinatario_email, conteudo)
            VALUES (%s, %s, %s, %s)
        """, (animal_id, remetente_email, destinatario_email, conteudo))

        conn.commit()
        conn.close()
        
        return jsonify({"mensagem": "Mensagem guardada com sucesso!"}), 201

    except Exception as e:
        print(f"Erro ao salvar mensagem no banco: {e}")
        return jsonify({"erro": f"Erro interno no servidor: {str(e)}"}), 500


@app.route("/chat/historico", methods=["GET"])
def obter_historico():
    animal_id = request.args.get("animal_id")
    usuario1 = request.args.get("usuario1")
    usuario2 = request.args.get("usuario2")

    if not usuario1 or not usuario2:
        return jsonify({"erro": "Parâmetros de utilizadores ausentes"}), 400

    try:
        conn = conectar_db()
        cursor = conn.cursor()

        # Procura mensagens trocadas entre os dois usuários (remetente -> destinatário OU destinatário -> remetente)
        cursor.execute("""
            SELECT remetente_email, conteudo, to_char(data_envio, 'HH24:MI') as hora 
            FROM mensagens
            WHERE (remetente_email = %s AND destinatario_email = %s)
               OR (remetente_email = %s AND destinatario_email = %s)
            ORDER BY data_envio ASC
        """, (usuario1, usuario2, usuario2, usuario1))

        mensagens = cursor.fetchall()
        conn.close()

        lista_mensagens = []
        for m in mensagens:
            lista_mensagens.append({
                "remetente": m[0],
                "conteudo": m[1],
                "hora": m[2]
            })

        return jsonify(lista_mensagens), 200

    except Exception as e:
        print(f"Erro ao carregar histórico: {e}")
        return jsonify({"erro": str(e)}), 500


@app.route("/chat/lista", methods=["GET"])
def listar_conversas():
    email_usuario = request.args.get("email")
    if not email_usuario:
        return jsonify({"erro": "Email não fornecido"}), 400

    try:
        conn = conectar_db()
        cursor = conn.cursor()

        # Agrupa as conversas para montar a barra lateral com o último texto enviado
        cursor.execute("""
            SELECT DISTINCT ON (
                CASE WHEN m.remetente_email = %s THEN m.destinatario_email ELSE m.remetente_email END
            )
                m.animal_id,
                CASE WHEN m.remetente_email = %s THEN m.destinatario_email ELSE m.remetente_email END as outro_email,
                m.conteudo,
                m.data_envio,
                COALESCE(u.nome, split_part(CASE WHEN m.remetente_email = %s THEN m.destinatario_email ELSE m.remetente_email END, '@', 1)) as outro_nome
            FROM mensagens m
            LEFT JOIN usuarios u ON u.email = (CASE WHEN m.remetente_email = %s THEN m.destinatario_email ELSE m.remetente_email END)
            WHERE m.remetente_email = %s OR m.destinatario_email = %s
            ORDER BY CASE WHEN m.remetente_email = %s THEN m.destinatario_email ELSE m.remetente_email END, m.data_envio DESC
        """, (email_usuario, email_usuario, email_usuario, email_usuario, email_usuario, email_usuario, email_usuario))

        resultados = cursor.fetchall()
        conn.close()

        lista_chats = []
        for r in resultados:
            lista_chats.append({
                "animal_id": r[0],
                "outro_usuario_email": r[1],
                "ultima_mensagem": r[2],
                "data": r[3].strftime('%Y-%m-%d %H:%M') if r[3] else "",
                "pet_breed": "Pet",  # Simplificado para evitar quebras por JOINs complexos durante os testes
                "outro_usuario_nome": r[4].capitalize()
            })

        return jsonify(lista_chats), 200

    except Exception as e:
        print(f"Erro ao listar conversas: {e}")
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)

