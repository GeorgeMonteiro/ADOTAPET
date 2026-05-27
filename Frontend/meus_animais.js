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

        // Mapeamento das chaves do backend
        card.innerHTML = `
            <div class="h-48 bg-slate-200 relative overflow-hidden">
                <img src="${urlImagem}" class="w-full h-full object-cover" alt="${pet.breed}">
                <span class="absolute top-2 right-2 bg-site-coral text-white text-xs font-bold px-2 py-1 rounded-xl uppercase font-fredoka">
                    ${pet.species}
                </span>
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
        alert("Erro ao deletar pet.");
    }
}