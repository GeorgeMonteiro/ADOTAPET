from db import conectar_db


# ===== CADASTRAR ANIMAL =====
def criar_animal(dados):

    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO animais (
            especie,
            raca,
            idade,
            porte,
            genero,
            localizacao,
            sobre,
            imagem_principal,
            dono_nome,
            dono_email
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        dados["especie"],
        dados["raca"],
        dados["idade"],
        dados["porte"],
        dados["genero"],
        dados["localizacao"],
        dados["sobre"],
        dados["imagem_principal"],
        dados["dono_nome"],
        dados["dono_email"]
    ))

    conn.commit()
    conn.close()


# ===== BUSCAR ANIMAIS DO USUÁRIO =====
def buscar_animais_usuario(email):

    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id,
            especie,
            raca,
            idade,
            porte,
            genero,
            localizacao,
            sobre,
            imagem_principal
        FROM animais
        WHERE dono_email = %s
        ORDER BY id DESC
    """, (email,))

    animais = cursor.fetchall()

    conn.close()

    return animais


# ===== DELETAR ANIMAL =====
def deletar_animal(id):

    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM animais
        WHERE id = %s
    """, (id,))

    conn.commit()
    conn.close()


# ===== EDITAR ANIMAL =====
def atualizar_animal(id, dados):

    conn = conectar_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE animais
        SET
            idade = %s,
            porte = %s,
            localizacao = %s
        WHERE id = %s
    """, (
        dados["idade"],
        dados["porte"],
        dados["localizacao"],
        id
    ))

    conn.commit()
    conn.close()