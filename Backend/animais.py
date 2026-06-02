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
            imagem_principal,
            status -- <-- Incluído aqui
        FROM animais
        WHERE dono_email = %s
        ORDER BY id DESC
    """, (email,))

    animais = cursor.fetchall()
    conn.close()
    return animais

# ===== EXPLORAR ANIMAIS =====
def buscar_animais_filtros(especie=None, raca=None, porte=None, localizacao=None):
    conn = conectar_db()
    cursor = conn.cursor()

    #  query trazendo apenas os que NÃO estão adotados 
    query = """
        SELECT 
            id, raca, idade, porte, genero, localizacao, sobre, imagem_principal, especie, status
        FROM animais
        WHERE (status IS NULL OR status != 'adotado')
    """
    valores = []


    if especie and especie != "todos":
        query += " AND LOWER(especie) = LOWER(%s)"
        valores.append(especie)

    if raca and raca != "todas":
        query += " AND LOWER(raca) = LOWER(%s)"
        valores.append(raca)

    if porte and porte != "todos":
        query += " AND LOWER(porte) = LOWER(%s)"
        valores.append(porte)

    if localizacao and localizacao != "todas":
        query += " AND LOWER(localizacao) = LOWER(%s)"
        valores.append(localizacao)

    query += " ORDER BY id DESC"

    cursor.execute(query, valores)
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

    try:
        cursor.execute("""
            UPDATE animais
            SET
                idade = %s,
                porte = %s,
                localizacao = %s,
                sobre = %s,
                status = %s
            WHERE id = %s
        """, (
            dados.get("idade"),
            dados.get("porte"),
            dados.get("localizacao"),
            dados.get("sobre"),
            dados.get("status", "não adotado"),
            id  
        ))

        # Verifica se alguma linha foi de fato modificada no banco
        linhas_afetadas = cursor.rowcount
        
        conn.commit()
        return linhas_afetadas > 0

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()