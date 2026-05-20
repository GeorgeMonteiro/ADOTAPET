// ========================================================================
// 1. GERENCIAMENTO DE TELAS E AUTENTICAÇÃO (LOGIN / CADASTRO)
// ========================================================================

// ===== ALTERNAR ENTRE TELAS =====
function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    if (loginCard && registerCard) {
        loginCard.classList.toggle('hidden');
        registerCard.classList.toggle('hidden');
    }
}

// ===== VALIDAÇÃO DE SENHA EM TEMPO REAL =====
const senhaInput = document.getElementById("senhaCadastro");
const reqElements = {
    length: document.getElementById("req-length"),
    nums: document.getElementById("req-nums"),
    upper: document.getElementById("req-upper"),
    lower: document.getElementById("req-lower"),
    special: document.getElementById("req-special")
};

const updateReq = (el, isValid, text) => {
    if (!el) return;
    if (isValid) {
        el.classList.remove("invalid");
        el.classList.add("valid");
        el.innerText = "✔ " + text;
    } else {
        el.classList.remove("valid");
        el.classList.add("invalid");
        el.innerText = "✖ " + text;
    }
};

if (senhaInput) {
    senhaInput.addEventListener("input", () => {
        const value = senhaInput.value;
        
        // Contagem segura de números para evitar quebras se match retornar null
        const numCount = (value.match(/\d/g) || []).length;

        updateReq(reqElements.length, value.length >= 8, "Mínimo de 8 caracteres");
        updateReq(reqElements.nums, numCount >= 2, "Mínimo de 2 números");
        updateReq(reqElements.upper, /[A-Z]/.test(value), "Pelo menos uma letra maiúscula");
        updateReq(reqElements.lower, /[a-z]/.test(value), "Pelo menos uma letra minúscula");
        updateReq(reqElements.special, /[!@#$%^&*(),.?":{}|<>]/.test(value), "Pelo menos um caractere especial (@, #, $, etc.)");
    });
}

// ===== CADASTRO COM ENVIO AO SERVIDOR =====
const cadastroForm = document.getElementById("cadastroForm");
const erroConfirmacao = document.getElementById("erro-confirmacao");
const confirmaSenhaInput = document.getElementById("confirmaSenha");

if (confirmaSenhaInput && erroConfirmacao) {
    confirmaSenhaInput.addEventListener("input", () => {
        erroConfirmacao.style.display = "none";
    });
}

if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nomeCadastro").value.trim();
        const email = document.getElementById("emailCadastro").value.trim();
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;
        
        // Evita crash se o grecaptcha não estiver carregado na página
        const captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : "";

        // 1. Validação de Coincidência de Senha
        if (senha !== confirmaSenha) {
            if (erroConfirmacao) erroConfirmacao.style.display = "block";
            confirmaSenhaInput.focus();
            return;
        }

        // 2. Validação Regex Corrigida e Segura (Mínimo 2 números sem travar lookahead)
        const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=(?:.*?\d){2}).{8,}$/;
        if (!senhaRegex.test(senha)) {
            alert("Sua senha não atende a todos os requisitos de segurança.");
            return;
        }

        // 3. Validação do Captcha
        if (!captchaResponse) {
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
            
            if (resposta.ok) {
                alert(dados.mensagem || "Cadastro realizado com sucesso!");
                cadastroForm.reset();
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

                // Reset visual dos requisitos da senha
                Object.entries(reqElements).forEach(([key, el]) => {
                    const labels = {
                        length: "Mínimo de 8 caracteres",
                        nums: "Mínimo de 2 números",
                        upper: "Pelo menos uma letra maiúscula",
                        lower: "Pelo menos uma letra minúscula",
                        special: "Pelo menos um caractere especial (@, #, $, etc.)"
                    };
                    updateReq(el, false, labels[key]);
                });
                
                if (erroConfirmacao) erroConfirmacao.style.display = "none";
            } else {
                alert(dados.erro || "Erro ao realizar cadastro.");
            }
        } catch (erro) {
            console.error("Erro na requisição de cadastro:", erro);
            alert("Não foi possível conectar ao servidor. Verifique sua conexão.");
        }
    });
}

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value;

        try {
            const resposta = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            
            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('usuarioNome', dados.nome || 'Usuário');
                window.location.href = "pagina_explorar.html";
            } else {
                alert(dados.erro || "E-mail ou senha incorretos.");
            }
        } catch (erro) {
            console.error("Erro na requisição de login:", erro);
            alert("Não foi possível conectar ao servidor. Verifique sua conexão.");
        }
    });
}


// ========================================================================
// 2. SISTEMA DE EXPLORAÇÃO, FILTROS SELETIVOS E DROPDOWN
// ========================================================================

const breedsData = {
    gato: [
        "Sem Raça Definida (SRD)", "Siamês", "Persa", 
        "Maine Coon", "Angorá", "Ragdoll", "Exótico"
    ],
    cachorro: [
        "Pomerânia (Spitz Alemão Anão)", "Rottweiler", "Golden Retriever", 
        "Bulldog Francês", "Border Collie", "Shih Tzu", "Chihuahua pelo longo", 
        "Pastor Belga Malinois", "Spitz Alemão pequeno", "Yorkshire Terrier", 
        "Sem raça definida (SRD)"
    ]
};

const typeSelect = document.getElementById('filter-type');
const breedSelect = document.getElementById('filter-breed');
const petsContainer = document.getElementById('pets-container');
const noPetsMessage = document.getElementById('no-pets-message');
const filterForm = document.getElementById('filter-form');

const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const userMenuArrow = document.getElementById('user-menu-arrow');
const btnLogout = document.getElementById('btn-logout');

// --- A. SUBMÓDULO: CONTROLE DO SELETOR DE ANIMAIS E CARDS ---
if (typeSelect && breedSelect && petsContainer) {

    const renderPets = (list) => {
        petsContainer.innerHTML = '';
        
        if (!list || list.length === 0) {
            if (noPetsMessage) noPetsMessage.classList.remove('hidden');
            return;
        }
        if (noPetsMessage) noPetsMessage.classList.add('hidden');

        // DocumentFragment otimiza a inserção em lote no DOM (melhora performance)
        const fragment = document.createDocumentFragment();

        list.forEach(pet => {
            const card = document.createElement('div');
            card.className = "bg-adota-card rounded-[20px] p-4 w-full max-w-[260px] mx-auto flex flex-col gap-3 shadow-sm";
            
            card.innerHTML = `
                <div class="w-full aspect-square rounded-lg overflow-hidden bg-white/40">
                    <img src="${pet.image || 'https://via.placeholder.com/400'}" alt="${pet.breed}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="grid grid-cols-2 gap-y-1 text-[14px] font-bold text-adota-textDark leading-tight">
                    <div class="truncate pr-1" title="${pet.breed}">${pet.breed}</div>
                    <div class="text-left pl-2">${pet.gender}</div>
                    <div>${pet.age}</div>
                    <div class="text-left pl-2">${pet.size}</div>
                    <div class="col-span-2 pt-0.5 font-semibold text-adota-textDark/90">${pet.location}</div>
                </div>
                <button class="w-full bg-adota-coral hover:bg-adota-coral-hover text-white font-fredoka font-medium py-1.5 rounded-full transition-colors shadow-sm text-center">
                    Ver detalhes
                </button>
            `;
            fragment.appendChild(card);
        });
        
        petsContainer.appendChild(fragment);
    };

    const updateBreedSelect = (type) => {
        breedSelect.innerHTML = '<option value="todas">Todas as raças</option>';
        
        if (type === 'todos') {
            breedSelect.disabled = true;
            return;
        }
        
        breedSelect.disabled = false;
        const breeds = breedsData[type] || [];
        
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.toLowerCase();
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    };

    typeSelect.addEventListener('change', function() {
        updateBreedSelect(this.value);
    });

    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedType = typeSelect.value;
            const selectedBreed = breedSelect.value;
            const sizeEl = document.getElementById('filter-size');
            const locationEl = document.getElementById('filter-location');

            const selectedSize = sizeEl ? sizeEl.value : 'todos';
            const selectedLocation = locationEl ? locationEl.value : 'todas';

            console.log("Filtros para consulta:", { selectedType, selectedBreed, selectedSize, selectedLocation });
        });
    }

    // Inicialização da tela de exploração
    updateBreedSelect('todos');
    renderPets([]); 
}

// --- B. SUBMÓDULO: INTERATIVIDADE DO DROPDOWN E NOME DINÂMICO ---
if (userMenuBtn && userDropdown) {
    
    const nomeSalvo = localStorage.getItem('usuarioNome');
    const userDisplayName = document.getElementById('user-display-name');
    
    if (nomeSalvo) {
        if (userDisplayName) userDisplayName.textContent = nomeSalvo;
        
        // Tratamento seguro para extração de iniciais (evita bugs com espaços duplos)
        const partesNome = nomeSalvo.trim().split(/\s+/);
        let iniciais = partesNome.charAt(0);
        if (partesNome.length > 1) {
            iniciais += partesNome[partesNome.length - 1].charAt(0);
        }
        
        const avatarSpan = userMenuBtn.querySelector('span.font-sans');
        if (avatarSpan) avatarSpan.textContent = iniciais.toUpperCase();
    }

    // Toggle do menu dropdown
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isHidden = userDropdown.classList.toggle('hidden');
        
        if (userMenuArrow) {
            if (!isHidden) {
                userMenuArrow.classList.add('rotate-180');
            } else {
                userMenuArrow.classList.remove('rotate-180');
            }
        }
    });

    // Fecha se clicar fora de qualquer elemento do menu
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userDropdown.classList.contains('hidden')) {
            userDropdown.classList.add('hidden');
            if (userMenuArrow) userMenuArrow.classList.remove('rotate-180');
        }
    });

    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem('usuarioNome');
            alert("Sessão encerrada!");
            window.location.href = "login.html";
        });
    }
}