function toggleScreens() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    // Alterna a classe 'hidden' entre os dois cards
    loginCard.classList.toggle('hidden');
    registerCard.classList.toggle('hidden');
}

// Opcional: Adicionar alerta ao enviar os formulários
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Botão funcionando! Dados enviados.');
    });
});