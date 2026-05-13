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

const updateReq = (el, isValid, text) => {
    if (isValid) {
        el.classList.replace("invalid", "valid");
        el.innerText = "✔ " + text;
    } else {
        el.classList.replace("valid", "invalid");
        el.innerText = "✖ " + text;
    }
};

if (senhaInput) {
    senhaInput.addEventListener("input", () => {
        const value = senhaInput.value;
        updateReq(reqLength, value.length >= 8, "Mínimo de 8 caracteres");
        updateReq(reqNums, (value.match(/\d/g) || []).length >= 2, "Mínimo de 2 números");
        updateReq(reqUpper, /[A-Z]/.test(value), "Pelo menos uma letra maiúscula");
        updateReq(reqLower, /[a-z]/.test(value), "Pelo menos uma letra minúscula");
        updateReq(reqSpecial, /[!@#$%^&*(),.?":{}|<>]/.test(value), "Pelo menos um caractere especial (@, #, $, etc.)");
    });
}

// ===== CADASTRO COM ENVIO AO SERVIDOR =====
const cadastroForm = document.getElementById("cadastroForm");
const erroConfirmacao = document.getElementById("erro-confirmacao");
const confirmaSenhaInput = document.getElementById("confirmaSenha");

// Esconde o erro enquanto o usuário digita novamente
if (confirmaSenhaInput) {
    confirmaSenhaInput.addEventListener("input", () => {
        erroConfirmacao.style.display = "none";
    });
}

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nomeCadastro").value;
        const email = document.getElementById("emailCadastro").value;
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;
        const captchaResponse = grecaptcha.getResponse();

        // 1. Validação Visual de Coincidência de Senha
        if (senha !== confirmaSenha) {
            erroConfirmacao.style.display = "block";
            confirmaSenhaInput.focus();
            return;
        }

        // 2. Validação Regex
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=(?:.*\d){2,}).{8,}$/;
        if (!senhaRegex.test(senha)) {
            alert("Sua senha não atende a todos os requisitos de segurança.");
            return;
        }

        // 3. Captcha
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
            
            if(resposta.ok) {
                alert(dados.mensagem);
                cadastroForm.reset();
                grecaptcha.reset();

                // RESET DOS REQUISITOS (Volta para o estado inicial vermelho com X)
                updateReq(reqLength, false, "Mínimo de 8 caracteres");
                updateReq(reqNums, false, "Mínimo de 2 números");
                updateReq(reqUpper, false, "Pelo menos uma letra maiúscula");
                updateReq(reqLower, false, "Pelo menos uma letra minúscula");
                updateReq(reqSpecial, false, "Pelo menos um caractere especial (@, #, $, etc.)");
                
                erroConfirmacao.style.display = "none";
            } else {
                alert(dados.erro);
            }
        } catch (erro) {
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