document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificação de Segurança (Precisa estar logado)
    const usuarioNome = localStorage.getItem('usuarioNome');
    if (!usuarioNome) {
        alert("Acesso negado. Por favor, faça login primeiro.");
        window.location.href = "login.html";
        return;
    }

    carregarMeusPets();
});

const container = document.getElementById('meus-pets-container');
const noPetsMessage = document.getElementById('no-pets-message');

// ===== BUSCAR ANIMAIS DO USUÁRIO NO BANCO =====
async function carregarMeusPets() {
    try {
        // Envia o nome ou token do usuário para o backend saber de quem buscar os pets
        const usuarioNome = localStorage.getItem('usuarioNome');
        
        const resposta = await fetch(`http://localhost:5001/meus-animais?usuario=${encodeURIComponent(usuarioNome)}`);
        const pets = await resposta.json();

        if (!resposta.ok) throw new Error(pets.erro || "Erro ao buscar pets");

        renderMeusPets(pets);
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar com o servidor.");
    }
}

// ===== RENDERIZAR CARDS COM MODIFICAÇÃO DE AÇÕES =====
function renderMeusPets(list) {
    container.innerHTML = '';
    
    if (!list || list.length === 0) {
        noPetsMessage.classList.remove('hidden');
        return;
    }
    noPetsMessage.classList.add('hidden');

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
            <div class="flex gap-2 pt-2">
                <button onclick="openEditModal(${JSON.stringify(pet).replace(/"/g, '&quot;')})" class="flex-1 bg-adota-textDark hover:opacity-90 text-white text-xs font-bold py-2 rounded-full transition-all text-center">
                    Editar
                </button>
                <button onclick="excluirPet('${pet._id || pet.id}')" class="flex-1 bg-adota-coral hover:bg-adota-coral-hover text-white text-xs font-bold py-2 rounded-full transition-all text-center">
                    Excluir
                </button>
            </div>
        `;
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

// ===== EXCLUIR ANIMAL =====
async function excluirPet(id) {
    if (!confirm("Tem certeza que deseja remover este anúncio de adoção?")) return;

    try {
        const resposta = await fetch(`http://localhost:5001/animais/${id}`, {
            method: "DELETE"
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.mensagem || "Pet removido com sucesso!");
            carregarMeusPets(); // Recarrega a lista atualizada
        } else {
            alert(dados.erro || "Não foi possível deletar.");
        }
    } catch (erro) {
        alert("Erro de conexão ao tentar deletar o pet.");
    }
}

// ===== CONTROLE DO MODAL DE EDIÇÃO =====
const modal = document.getElementById('edit-modal');

function openEditModal(pet) {
    document.getElementById('edit-pet-id').value = pet._id || pet.id;
    document.getElementById('edit-pet-age').value = pet.age;
    document.getElementById('edit-pet-size').value = pet.size;
    document.getElementById('edit-pet-location').value = pet.location;
    modal.classList.remove('hidden');
}

function closeEditModal() {
    modal.classList.add('hidden');
}

// Envio das alterações
document.getElementById('edit-pet-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-pet-id').value;
    
    const dadosAtualizados = {
        age: document.getElementById('edit-pet-age').value,
        size: document.getElementById('edit-pet-size').value,
        location: document.getElementById('edit-pet-location').value
    };

    try {
        const resposta = await fetch(`http://localhost:5001/animais/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAtualizados)
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Dados atualizados com sucesso!");
            closeEditModal();
            carregarMeusPets();
        } else {
            alert(dados.erro || "Falha na atualização");
        }
    } catch (erro) {
        alert("Erro de conexão ao atualizar.");
    }
});