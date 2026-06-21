import os
import pytest

def test_cenario_1_cadastro_usuario(client):
    payload = {
        "nome": "bianka", 
        "email": "bia@teste.com", 
        "senha": "senha_segura_123"
    }
    resposta = client.post("/cadastro", json=payload)
    
    assert resposta.status_code == 201
    assert resposta.json["mensagem"] == "Cadastro realizado com sucesso!"

    # Validar criptografia diretamente no Banco de Dados
    from db import conectar_db
    conn = conectar_db()
    cursor = conn.cursor()
    # CORRIGIDO: Agora busca o e-mail correto ('bia@teste.com')
    cursor.execute("SELECT senha FROM usuarios WHERE email = 'bia@teste.com';")
    senha_bd = cursor.fetchone()[0]
    conn.close()
    
    assert senha_bd != "senha_segura_123"  # Não pode ser texto limpo
    assert senha_bd.startswith("$2b$")     # Segue o formato hash do bcrypt


def test_cenario_2_login_usuario_valido(client):
    # Pré-condição: Cadastrar o usuário
    client.post("/cadastro", json={
        "nome": "George", 
        "email": "geo@teste.com", 
        "senha": "password123"
    })
    
    # Execução do Login
    payload_login = {
        "email": "geo@teste.com", 
        "senha": "password123"
    }
    resposta = client.post("/login", json=payload_login)
    
    assert resposta.status_code == 200
    assert "usuario" in resposta.json
    # CORRIGIDO: Validando o e-mail real do usuário logado
    assert resposta.json["usuario"]["email"] == "geo@teste.com"


def test_cenario_3_listagem_pets_disponiveis(client):
    # Pré-condição: Cadastrar um animal através da API
    payload_animal = {
        "especie": "Gato", 
        "raca": "Persa", 
        "idade": "1 ano", 
        "porte": "Pequeno",
        "genero": "Fêmea", 
        "localizacao": "Paulista", 
        "sobre": "Super meiga.",
        "imagem_principal": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "dono_nome": "Doador Teste", 
        "dono_email": "doador@teste.com"
    }
    client.post("/animais", json=payload_animal)

    # Execução da listagem
    resposta = client.get("/explorar-animais")
    
    assert resposta.status_code == 200
    dados = resposta.json
    assert len(dados) == 1
    
    primeiro_pet = dados[0]
    
    assert primeiro_pet["species"] == "Gato"
    assert primeiro_pet["status"] == "disponível"


# === Cenário 4: Upload de foto do animal (Base64) ===
def test_cenario_4_upload_foto_animal(client):
    payload_animal = {
        "especie": "Cachorro", 
        "raca": "Boxer", 
        "idade": "3 anos", 
        "porte": "Grande",
        "genero": "Macho", 
        "localizacao": "Braga", 
        "sobre": "Muito enérgico.",
        "imagem_principal": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "dono_nome": "george", 
        "dono_email": "geo@teste.com"
    }
    
    resposta = client.post("/animais", json=payload_animal)
    assert resposta.status_code == 201

    # Obter o caminho gerado para o arquivo de imagem
    resposta_busca = client.get("/explorar-animais")
    caminho_imagem = resposta_busca.json[0]["imagem_principal"]
    
    assert caminho_imagem.startswith("uploads/")
    assert os.path.exists(caminho_imagem)  
    
    # Limpeza do arquivo criado pelo teste 
    if os.path.exists(caminho_imagem):
        os.remove(caminho_imagem)


def test_cenario_5_login_com_sucesso(client):
    # 1. Cadastra o usuário primeiro
    payload_cadastro = {
        "nome": "Maria Souza",
        "email": "maria@example.com",
        "senha": "password123"
    }
    client.post("/cadastro", json=payload_cadastro)

    # 2. Tenta fazer o login
    payload_login = {
        "email": "maria@example.com",
        "senha": "password123"
    }
    resposta = client.post("/login", json=payload_login)

    assert resposta.status_code == 200
    assert resposta.json["mensagem"] == "Login realizado com sucesso!"
    assert resposta.json["usuario"]["nome"] == "Maria Souza"
    assert resposta.json["usuario"]["email"] == "maria@example.com"


def test_cenario_6_login_senha_incorreta(client):
    # 1. Cadastra o usuário primeiro
    client.post("/cadastro", json={
        "nome": "Maria", 
        "email": "maria@example.com", 
        "senha": "correta"
    })

    # 2. Tenta logar com senha errada
    payload_login = {
        "email": "maria@example.com",
        "senha": "errada"
    }
    resposta = client.post("/login", json=payload_login)

    assert resposta.status_code == 401
    assert resposta.json["erro"] == "Senha incorreta"


def test_cenario_7_cadastrar_e_listar_animais(client):
    payload_animal = {
        "especie": "Cachorro",
        "raca": "Vira-lata",
        "idade": "2 anos",
        "porte": "Médio",
        "genero": "Macho",
        "localizacao": "Recife",
        "sobre": "Muito dócil e brincalhão.",
        "imagem_principal": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "dono_nome": "Carlos",
        "dono_email": "carlos@example.com"
    }

    # 1. Cadastra o animal
    resposta_cadastro = client.post("/animais", json=payload_animal)
    assert resposta_cadastro.status_code == 201

    # 2. Explora os animais filtrando por espécie
    resposta_busca = client.get("/explorar-animais?especie=Cachorro")
    assert resposta_busca.status_code == 200
    
    dados_animais = resposta_busca.json
    assert len(dados_animais) == 1
    
    primeiro_pet = dados_animais[0]
    assert primeiro_pet["species"] == "Cachorro"
    assert primeiro_pet["breed"] == "Vira-lata"
    assert primeiro_pet["dono_email"] == "carlos@example.com"
    
    # Limpeza da imagem física criada pelo upload 
    caminho_imagem = primeiro_pet["imagem_principal"]
    if os.path.exists(caminho_imagem):
        os.remove(caminho_imagem)