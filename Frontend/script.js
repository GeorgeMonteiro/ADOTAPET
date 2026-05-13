function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    // Alterna a classe 'hidden' entre os dois cards
    loginCard.classList.toggle('hidden');
    registerCard.classList.toggle('hidden');
}

// ===== CADASTRO COM VALIDAÇÃO E RECAPTCHA =====
const cadastroForm = document.getElementById("cadastroForm");

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Pegar os valores dos campos
        const nome = document.getElementById("nomeCadastro").value;
        const email = document.getElementById("emailCadastro").value;
        const senha = document.getElementById("senhaCadastro").value;
        const confirmaSenha = document.getElementById("confirmaSenha").value; // Novo campo
        const captchaResponse = grecaptcha.getResponse(); // Resposta do reCAPTCHA

        // 2. Validação: As senhas coincidem?
        if (senha !== confirmaSenha) {
            alert("As senhas não coincidem. Por favor, tente novamente.");
            return; // Interrompe a execução aqui
        }

        // 3. Validação: O captcha foi preenchido?
        if (captchaResponse.length === 0) {
            alert("Por favor, confirme que você não é um robô.");
            return; // Interrompe a execução aqui
        }

        // 4. Se passou nas validações, envia para o servidor (Seu código original)
        try {
            const resposta = await fetch("http://localhost:5001/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    nome, 
                    email, 
                    senha,
                    captcha: captchaResponse // Opcional: Enviar o token do captcha para o backend validar
                })
            });

            const dados = await resposta.json();
            alert(resposta.ok ? dados.mensagem : dados.erro);
            
            if(resposta.ok) {
                grecaptcha.reset(); // Limpa o captcha após sucesso
                cadastroForm.reset(); // Limpa o formulário
            }

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert("Erro ao conectar com o servidor");
        }
    });
}


// ===== LOGIN (Mantido original) =====
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
            console.error("Erro no login:", erro);
            alert("Erro ao conectar com o servidor");
        }
    });
}