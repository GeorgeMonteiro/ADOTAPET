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

// Aguarda o DOM carregar completamente antes de interagir com os elementos
document.addEventListener("DOMContentLoaded", () => {
    
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

    if (cadastroForm && senhaInput && confirmaSenhaInput) {
        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nome = document.getElementById("nomeCadastro").value.trim();
            const email = document.getElementById("emailCadastro").value.trim();
            const senha = senhaInput.value;
            const confirmaSenha = confirmaSenhaInput.value;
            
            const captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : "";

            if (senha !== confirmaSenha) {
                if (erroConfirmacao) erroConfirmacao.style.display = "block";
                confirmaSenhaInput.focus();
                return;
            }

            const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=(?:.*?\d){2}).{8,}$/;
            if (!senhaRegex.test(senha)) {
                alert("Sua senha não atende a todos os requisitos de segurança.");
                return;
            }

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

    // ===== LÓGICA DA TELA DE LOGIN =====
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("emailLogin").value;
            const senha = document.getElementById("senhaLogin").value;

            try {
                const response = await fetch("http://127.0.0.1:5001/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha })
                });

                const dados = await response.json();

                if (response.ok) {
                    localStorage.setItem("usuario_logado", JSON.stringify(dados.usuario));
                    alert("Login realizado com sucesso!");
                    window.location.href = "pagina_explorar.html";
                } else {
                    alert(`Erro: ${dados.erro}`);
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro ao conectar com o servidor.");
            }
        });
    }

    // ===== 2. CONTROLE DE SESSÃO E NOME DINÂMICO =====
    const usuarioLogadoString = localStorage.getItem("usuario_logado");
    const ehPaginaPublica = window.location.pathname.includes("login.html") || window.location.pathname.includes("cadastro.html") || window.location.pathname.includes("index.html");

    if (!usuarioLogadoString && !ehPaginaPublica) {
        alert("Você precisa fazer login para acessar esta página.");
        window.location.href = "login.html";
        return;
    } 
    
    if (usuarioLogadoString) {
        const usuario = JSON.parse(usuarioLogadoString);
        const userDisplayName = document.getElementById("user-display-name");
        const userMenuBtn = document.getElementById('user-menu-btn');

        if (userDisplayName) {
            userDisplayName.textContent = usuario.nome;
        }
        
        if (userMenuBtn) {
            const partesNome = usuario.nome.trim().split(/\s+/);
            let iniciais = partesNome[0].charAt(0); 
            if (partesNome.length > 1) {
                iniciais += partesNome[partesNome.length - 1].charAt(0);
            }
            
            const avatarSpan = userMenuBtn.querySelector('span.font-sans') || userMenuBtn.querySelector('span.font-bold');
            if (avatarSpan) avatarSpan.textContent = iniciais.toUpperCase();
        }
    }

    // ===== 3. COMPORTAMENTO UNIFICADO DO MENU DROPDOWN E LOGOUT =====
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const userMenuArrow = document.getElementById('user-menu-arrow');
    const btnLogout = document.getElementById('btn-logout');

    if (userMenuBtn && userDropdown) {
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

        document.addEventListener('click', function(e) {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
                if (userMenuArrow) userMenuArrow.classList.remove('rotate-180');
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem("usuario_logado");
            alert("Sessão encerrada!");
            window.location.href = "login.html";
        });
    }

    // ========================================================================
    // 2. SISTEMA DE EXPLORAÇÃO E FILTROS SELETIVOS
    // ========================================================================
    const typeSelect = document.getElementById('filter-type');
    const breedSelect = document.getElementById('filter-breed');
    const petsContainer = document.getElementById('pets-container');
    const noPetsMessage = document.getElementById('no-pets-message');
    const filterForm = document.getElementById('filter-form');

    if (typeSelect && breedSelect && petsContainer) {

       // Função global/compartilhada para renderizar os cards com as tags abaixo da imagem
        window.renderizarCardsNaTela = function(list) {
            petsContainer.innerHTML = '';
            
            if (!list || list.length === 0) {
                if (noPetsMessage) noPetsMessage.classList.remove('hidden');
                return;
            }
            if (noPetsMessage) noPetsMessage.classList.add('hidden');

            const fragment = document.createDocumentFragment();

            list.forEach(pet => {
                const card = document.createElement('div');
                card.className = "bg-white rounded-[28px] overflow-hidden p-4 shadow-sm border border-slate-100 flex flex-col gap-4";
                
                // Força o texto para 'disponível' se vier do banco antigo como 'não adotado'
                let statusPet = pet.status || 'disponível';
                if (statusPet.toLowerCase() === 'não adotado') {
                    statusPet = 'disponível';
                }
                
                const statusColor = statusPet.toLowerCase() === 'adotado' ? 'bg-gray-400' : 'bg-[#93b082]';

                card.innerHTML = `
                    <div class="h-56 bg-slate-200 relative rounded-[20px] overflow-hidden">
                        <img src="${pet.image}" alt="${pet.breed}" class="w-full h-full object-cover" loading="lazy">
                    </div>

                    <div class="flex flex-col flex-grow justify-between px-1 pb-1">
                        <div class="space-y-2.5">
                            
                            <div class="flex gap-2 items-center">
                                <span class="${statusColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-fredoka tracking-wider shadow-sm">
                                    ${statusPet}
                                </span>
                                
                                <span class="bg-[#f37676] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-fredoka tracking-wider shadow-sm">
                                    ${pet.species}
                                </span>
                            </div>

                            <h4 class="font-fredoka font-bold text-[#001730] text-xl lowercase first-letter:uppercase pt-1">
                                ${pet.breed}
                            </h4>
                            
                            <p class="text-sm text-blue-900/60 font-medium line-clamp-2 leading-relaxed">
                                ${pet.description || 'Sem descrição informada.'}
                            </p>
                            
                            <span class="text-sm text-gray-400 font-medium flex items-center gap-1 mt-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
                                </svg>
                                ${pet.location || 'Não informada'}
                            </span>
                        </div>
                        
                       <div class="mt-4">
                            <button onclick="entrarEmContato(${pet.id}, '${pet.dono_email}')" class="w-full bg-[#f37676] hover:bg-[#e26363] text-white font-fredoka text-base font-semibold py-2.5 rounded-full transition-all shadow-sm text-center cursor-pointer">
                                entrar em contato
                            </button>
                        </div>
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

                buscarAnimais(selectedType,selectedBreed,selectedSize,selectedLocation);
            });
        }

        updateBreedSelect('todos');
        buscarAnimais("todos", "todas", "todos", "todas");
    }
});

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

async function buscarAnimais(especie, raca, porte, localizacao) {
    try {
        const params = new URLSearchParams({ especie, raca, porte, localizacao });

        const resposta = await fetch(`http://localhost:5001/explorar-animais?${params}`);
        const pets = await resposta.json();

        if (!resposta.ok) {
            throw new Error(pets.erro);
        }

        /* CORREÇÃO DO MAPEAMENTO DA TUPLA:
           De acordo com a criação da tabela no seu db.py:
           animal[0] -> id
           animal[1] -> especie
           animal[2] -> raca
           animal[3] -> idade
           animal[4] -> porte
           animal[5] -> genero
           animal[6] -> localizacao
           animal[7] -> sobre (descrição)
           animal[8] -> imagem_principal
           ...
           animal[12] -> dono_email
           animal[13] -> status
        */
        const petsFormatados = pets.map(animal => {
            // Se o back-end já devolver como objeto usa a propriedade, se for array usa o índice
            const idValido = animal.id !== undefined ? animal.id : animal[0];
            const racaValida = animal.raca || animal[2] || "Sem Raça Definida";
            const especieValida = animal.especie || animal[1] || "Pet";
            const localizacaoValida = animal.localizacao || animal[6] || "Não informada";
            const descricaoValida = animal.sobre || animal[7] || "Sem descrição informada.";
            const imagemValida = animal.imagem_principal || animal[8];
            const emailValido = animal.dono_email || animal[12] || "suporte@adotapet.com";
            const statusValido = animal.status || animal[13] || "Disponível";

            return {
                id: idValido,
                image: imagemValida ? `http://localhost:5001/${imagemValida}` : 'https://via.placeholder.com/400',
                breed: racaValida,
                species: especieValida,
                description: descricaoValida,
                location: localizacaoValida,
                status: statusValido,
                dono_email: emailValido
            };
        });

        console.log("Pets carregados com sucesso para o ecrã:", petsFormatados);

        if (typeof window.renderizarCardsNaTela === "function") {
            window.renderizarCardsNaTela(petsFormatados);
        }

    } catch (erro) {
        console.error("Erro ao buscar animais da API:", erro);
        alert("Erro ao buscar animais.");
    }
}

function entrarEmContato(animalId, donoEmail) {
    console.log("-> Botão Clicado! ID do Animal:", animalId, "E-mail do Dono:", donoEmail);
    
    if (!animalId || !donoEmail) {
        console.error("ERRO: ID do animal ou E-mail do dono estão vazios!");
        alert("Não foi possível iniciar o chat. Dados incompletos.");
        return;
    }
    
    // Mude de mensagens.html para chatInterno.html se for o caso:
    const urlDestino = `chatInterno.html?id=${animalId}&dono=${encodeURIComponent(donoEmail)}`;
    console.log("Redirecionando para:", urlDestino);
    window.location.href = urlDestino;
}