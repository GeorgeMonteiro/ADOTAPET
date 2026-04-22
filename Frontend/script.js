function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    // Alterna a classe 'hidden' entre os dois cards
    loginCard.classList.toggle('hidden');
    registerCard.classList.toggle('hidden');
}


document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("http://localhost:5001/cadastro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        alert(dados.mensagem);
    } else {
        alert(dados.erro);
    }
});