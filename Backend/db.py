import os
import psycopg2
from dotenv import load_dotenv

# Obtém o caminho absoluto da pasta onde o db.py está e localiza o ficheiro .env
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"))

def conectar_db():

    print("USER:", os.getenv("DB_USER"))
    print("DB:", os.getenv("DB_NAME"))

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

def criar_tabela():
    conn = conectar_db()
    cursor = conn.cursor()

    # Tabela de Usuários (Autenticação)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    """)
    
    # Tabela de Animais (Cadastro de Pets)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS animais (
            id SERIAL PRIMARY KEY,
            especie TEXT NOT NULL,
            raca TEXT NOT NULL,
            idade TEXT,
            porte TEXT,
            genero TEXT,
            localizacao TEXT,
            sobre TEXT,
            imagem_principal TEXT, 
            galeria_fotos TEXT[],  
            video TEXT,
            dono_nome TEXT NOT NULL,
            dono_email TEXT NOT NULL,
            status TEXT DEFAULT 'não adotado'
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mensagens (
            id SERIAL PRIMARY KEY,
            animal_id INT NOT NULL,
            remetente_email TEXT NOT NULL,
            destinatario_email TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

    