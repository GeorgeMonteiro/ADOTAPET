# 🐾 AdotaPet
## Plataforma Inteligente para Adoção Responsável de Animais

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/Academic-Project-orange)

---

# 📋 Visão Geral

O **AdotaPet** é uma plataforma web desenvolvida com o objetivo de facilitar a adoção responsável de animais, conectando pessoas interessadas em adotar com usuários que desejam disponibilizar seus pets para adoção.

O sistema foi desenvolvido utilizando arquitetura cliente-servidor, integrando:

- Frontend Web
- API REST em Flask
- Banco de Dados PostgreSQL
- Sistema de autenticação
- Upload de imagens
- Chat interno entre usuários
- Gerenciamento de animais cadastrados

---

# 🎯 Problema e Solução

Milhares de animais aguardam adoção enquanto potenciais adotantes têm dificuldade em encontrar informações centralizadas e atualizadas.

O AdotaPet busca resolver esse problema oferecendo:

✅ Divulgação de animais disponíveis

✅ Comunicação entre adotante e responsável

✅ Cadastro simplificado

✅ Gerenciamento de anúncios

✅ Controle do status de adoção

---

# 🏗️ Arquitetura da Solução

```text
                    ┌─────────────────┐
                    │     Usuário     │
                    └────────┬────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │      Frontend        │
                 │ HTML • CSS • JS      │
                 └──────────┬───────────┘
                            │ HTTP/JSON
                            ▼
                 ┌──────────────────────┐
                 │    Flask API REST    │
                 │      app.py          │
                 └──────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ┌────────────┐     ┌────────────┐     ┌────────────┐
 │ usuarios.py│     │ animais.py │     │ Uploads    │
 │ Autenticação│    │ CRUD Pets  │     │ Imagens    │
 └──────┬─────┘     └──────┬─────┘     └────────────┘
        │                  │
        └──────────┬───────┘
                   ▼
          ┌─────────────────┐
          │      db.py      │
          │ PostgreSQL Conn │
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   PostgreSQL    │
          └─────────────────┘
```
---

# 🛠️ Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask
- Flask-CORS
- Bcrypt

### Banco de Dados

- PostgreSQL

### Testes

- Pytest

---

# 👥 Funcionalidades

## Usuários

- Cadastro
- Login
- Perfil do usuário
- Atualização de informações

## Animais

- Cadastro de pets
- Upload de fotos
- Edição de cadastro
- Exclusão
- Atualização de status

## Pesquisa

- Listagem de animais
- Exploração de anúncios
- Visualização detalhada

## Comunicação

- Chat interno
- Contato entre adotante e responsável

---

## Desenvolvedores
- George Monteiro
- Bianka Ibrahim
