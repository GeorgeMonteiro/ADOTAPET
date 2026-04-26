function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    // Alterna a classe 'hidden' entre os dois cards
    loginCard.classList.toggle('hidden');
    registerCard.classList.toggle('hidden');
}

// ===== CADASTRO =====
const cadastroForm = document.getElementById("cadastroForm");

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nomeCadastro").value;
        const email = document.getElementById("emailCadastro").value;
        const senha = document.getElementById("senhaCadastro").value;

        const resposta = await fetch("http://localhost:5001/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();
        alert(resposta.ok ? dados.mensagem : dados.erro);
    });
}


// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("emailLogin").value;
        const senha = document.getElementById("senhaLogin").value;

        try {
            const resposta = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();
            alert(resposta.ok ? dados.mensagem : dados.erro);

        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor");
        }
    });
}