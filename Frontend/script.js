// ===== ALTERNAR ENTRE TELAS =====
function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    loginCard.classList.toggle('hidden');
    registerCard.classList.toggle('hidden');
}

// ===== VALIDAÇÃO DE SENHA EM TEMPO REAL =====
const senhaInput = document.getElementById("senhaCadastro");
const reqLength = document.getElementById("req-length");
const reqNums = document.getElementById("req-nums");
const reqUpper = document.getElementById("req-upper");
const reqLower = document.getElementById("req-lower");
const reqSpecial = document.getElementById("req-special");

if (senhaInput) {
    senhaInput.addEventListener("input", () => {
        const value = senhaInput.value;

        // Função auxiliar para atualizar o visual
        const updateReq = (el, isValid, text) => {
            if (isValid) {
                el.classList.replace("invalid", "valid");
                el.innerText = "✔ " + text;
            } else {
                el.classList.replace("valid", "invalid");
                el.innerText = "✖ " + text;
            }
        };

        updateReq(reqLength, value.length >= 8, "Mínimo de 8 caracteres");
        updateReq(reqNums, (value.match(/\d/g) || []).length >= 2, "Mínimo de 2 números");
        updateReq(reqUpper, /[A-Z]/.test(value), "Pelo menos uma letra maiúscula");
        updateReq(reqLower, /[a-z]/.test(value), "Pelo menos uma letra minúscula");
        updateReq(reqSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(value), "Pelo menos um caractere especial (@, #, $, etc.)");
    });
}

// ===== CADASTRO COM ENVIO AO SERVIDOR =====
const cadastroForm = document.getElementById("cadastroForm");

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nomeCadastro").value;
        const email = document.getElementById("emailCadastro").value;
        const senha = document.getElementById("senhaCadastro").value;
        const confirmaSenha = document.getElementById("confirmaSenha").value;
        const captchaResponse = grecaptcha.getResponse();

        // Validação final de senha forte (Regex atualizada para 2 números)
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=(?:.*\d){2,}).{8,}$/;
        
        if (!senhaRegex.test(senha)) {
            alert("Sua senha não atende a todos os requisitos de segurança.");
            return;
        }

        if (senha !== confirmaSenha) {
            alert("As senhas não coincidem.");
            return;
        }

        if (captchaResponse.length === 0) {
            alert("Por favor, confirme que você não é um robô.");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:5001/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha, captcha: captchaResponse })
            });

            const dados = await resposta.json();
            alert(resposta.ok ? dados.mensagem : dados.erro);
            
            if(resposta.ok) {
                grecaptcha.reset();
                cadastroForm.reset();
                // Opcional: resetar as cores dos requisitos
                location.reload(); 
            }
        } catch (erro) {
            console.error("Erro:", erro);
            alert("Erro ao conectar com o servidor");
        }
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            const dados = await resposta.json();
            alert(resposta.ok ? dados.mensagem : dados.erro);
        } catch (erro) {
            alert("Erro ao conectar com o servidor");
        }
    });
}