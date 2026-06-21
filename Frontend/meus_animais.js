document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario_logado"));

    if (!usuario || !usuario.email) {
        alert("Acesso negado. Faça login.");
        window.location.href = "login.html";
        return;
    }

    carregarMeusPets(usuario.email);
});

const container = document.getElementById('pets-grid');
// Variável global para armazenar a lista de pets carregada do servidor
let listaDePetsLocal = [];

// ===== BUSCAR PETS =====
async function carregarMeusPets(email) {

    try {
        const resposta = await fetch(
            `http://localhost:5001/meus-animais?email=${encodeURIComponent(email)}`
        );

        const pets = await resposta.json();

        if (!resposta.ok) {
            throw new Error(pets.erro || "Erro ao buscar pets");
        }

        // Guarda os pets na variável global para podermos ler os dados ao editar
        listaDePetsLocal = pets;
        renderMeusPets(pets);

    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor.");
    }
}

// ===== RENDER =====
function renderMeusPets(list) {
    const container = document.getElementById('pets-grid');
    
    container.innerHTML = '';

    if (!list || list.length === 0) {
        container.innerHTML = `
            <p class="text-center text-white font-fredoka col-span-full py-8">
                Você ainda não cadastrou nenhum pet 🐾
            </p>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach(pet => {
        const card = document.createElement('div');

        card.className = "bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col";

        const urlImagem = `http://localhost:5001/${pet.imagem_principal}`;

        // Verifica o status do pet vindo do BD para definir a cor Verde da Tag
        const statusPet = pet.status || 'não adotado';
        let tagStatusHtml = '';
        
        if (statusPet === 'adotado') {
            // Verde Esmeralda vibrante para a comemoração do adotado
            tagStatusHtml = `<span class="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-xl shadow-sm uppercase font-fredoka">Adotado 🎉</span>`;
        } else {
            // Verde oliva padrão do site para os animais disponíveis
            tagStatusHtml = `<span class="bg-[#93b082] text-white text-xs font-bold px-2 py-1 rounded-xl shadow-sm uppercase font-fredoka">Disponível</span>`;
        }

        card.innerHTML = `
            <div class="h-48 bg-slate-200 relative overflow-hidden">
                <img src="${urlImagem}" class="w-full h-full object-cover" alt="${pet.breed}">
                
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between z-10">
                    ${tagStatusHtml}
                    
                    <span class="bg-site-coral text-white text-xs font-bold px-2 py-1 rounded-xl uppercase font-fredoka">
                        ${pet.species}
                    </span>
                </div>
            </div>

            <div class="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <h4 class="font-fredoka font-bold text-slate-900 text-lg mb-1">${pet.breed}</h4>
                    <p class="text-sm text-slate-600 line-clamp-2">${pet.description || 'Sem descrição.'}</p>
                    <span class="text-xs text-slate-400 block mt-2">
                        <i class="fa-solid fa-location-dot mr-1"></i>${pet.location || 'Não informada'}
                    </span>
                </div>

                <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button onclick="abrirModalEditar('${pet.id}')"
                        class="bg-amber-500 hover:bg-amber-600 text-white drop-shadow-sm text-xs font-fredoka px-3 py-2 rounded-xl smooth-transition w-full flex items-center justify-center gap-1">
                        <i class="fa-solid fa-pen-to-square text-xs"></i> Editar Pet
                    </button>

                    <button onclick="excluirPet(${pet.id})"
                        class="bg-red-500 hover:bg-red-600 text-white text-xs font-fredoka px-3 py-2 rounded-xl smooth-transition w-full flex items-center justify-center gap-1">
                        <i class="fa-solid fa-trash-can text-xs"></i> Excluir Pet
                    </button>
                </div>
            </div>
        `;

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// ===== EXCLUIR =====
async function excluirPet(id) {

    if (!confirm("Deseja remover este pet?")) return;

    try {
        const resposta = await fetch(`http://localhost:5001/animais/${id}`, {
            method: "DELETE"
        });

        const dados = await resposta.json();

        if (!resposta.ok) throw new Error(dados.erro);

        alert("Pet removido!");

        const usuario = JSON.parse(localStorage.getItem("usuario_logado"));
        carregarMeusPets(usuario.email);

    } catch (erro) {
        alert("Pet removido!");
        const usuario = JSON.parse(localStorage.getItem("usuario_logado"));
        carregarMeusPets(usuario.email);
    }
}

// ===== FUNÇÕES DO MODAL DE EDIÇÃO COM CARREGAMENTO DE DADOS =====
function abrirModalEditar(id) {
    const modal = document.getElementById('modal-editar');
    if (!modal) return;

    const petSelecionado = listaDePetsLocal.find(p => String(p.id) === String(id));

    if (petSelecionado) {
        modal.classList.remove('hidden');

        document.getElementById('edit-pet-id').value = petSelecionado.id;
        document.getElementById('edit-pet-porte').value = petSelecionado.size || 'médio';
        document.getElementById('edit-pet-localizacao').value = petSelecionado.location || '';
        document.getElementById('edit-pet-sobre').value = petSelecionado.description || '';

        const campoIdade = document.getElementById('edit-pet-idade');
        if (campoIdade && petSelecionado.age) {
            campoIdade.value = petSelecionado.age.toLowerCase();
        } else if (campoIdade) {
            campoIdade.value = '';
        }

        const camposStatus = document.getElementsByName('edit-pet-status');
        const statusPet = petSelecionado.status || 'não adotado';
        
        camposStatus.forEach(radio => {
            if (radio.value === statusPet) {
                radio.checked = true;
            }
        });
    } else {
        alert("Não foi possível carregar os dados deste pet.");
    }
}

function fecharModalEditar() {
    const modal = document.getElementById('modal-editar');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ===== INTERCEPTA O FORMULÁRIO E ENVIA OS DADOS AO SERVIDOR =====
document.getElementById('form-editar-pet')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('edit-pet-id').value;
    const idade = document.getElementById('edit-pet-idade').value;
    const porte = document.getElementById('edit-pet-porte').value;
    const localizacao = document.getElementById('edit-pet-localizacao').value;
    const sobre = document.getElementById('edit-pet-sobre').value;
    
    let status = 'não adotado';
    const camposStatus = document.getElementsByName('edit-pet-status');
    camposStatus.forEach(radio => {
        if (radio.checked) {
            status = radio.value;
        }
    });

    const dadosAtualizados = {
        idade: idade,
        porte: porte,
        localizacao: localizacao,
        sobre: sobre,
        status: status
    };

    try {
        const resposta = await fetch(`http://localhost:5001/animais/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosAtualizados)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            fecharModalEditar();
            
            const usuario = JSON.parse(localStorage.getItem("usuario_logado"));
            if (usuario && usuario.email) {
                carregarMeusPets(usuario.email);
            }
        } else {
            alert(dados.erro || "Erro ao atualizar o pet.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor.");
    }
});