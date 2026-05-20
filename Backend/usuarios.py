from db import conectar_db
import bcrypt

def criar_usuario(nome, email, senha):

    # gerar hash
    senha_hash = bcrypt.hashpw(
        senha.encode("utf-8"),
        bcrypt.gensalt(rounds=12)
    ).decode("utf-8")

    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
        (nome, email, senha_hash)
    )

    conn.commit()
    conn.close()


def buscar_usuario_por_email(email):
    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM usuarios WHERE email = %s",
        (email,)
    )

    usuario = cursor.fetchone()
    conn.close()

    return usuario