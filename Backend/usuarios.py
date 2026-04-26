from db import conectar_db

def criar_usuario(nome, email, senha):
    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
        (nome, email, senha)
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