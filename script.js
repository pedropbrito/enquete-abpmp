// Dados mockados para exibição. Na vida real, viriam de uma API.
const candidatesData = [
    {
        id: 1,
        name: "Robô",
        image: "robo.png", // Imagem que o usuário vai inserir na pasta
        fallback: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400&h=500", // Robô genérico
        votes: 145,
        description: "Idealizado com base no universo BPM, representando a cultura de processos, inovação, melhoria contínua e excelência operacional."
    },
    {
        id: 2,
        name: "FLUX",
        image: "flux.png",
        fallback: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=400&h=500", // Camaleão genérico
        votes: 210,
        description: "O camaleão dos processos. Representa a adaptabilidade com olhos de 360º para enxergar ponta a ponta sem pontos cegos."
    },
    {
        id: 3,
        name: "Padim Cesso",
        image: "padim.png",
        fallback: "https://images.unsplash.com/photo-1542103444-245089e90000?auto=format&fit=crop&q=80&w=400&h=500", // Imagem temática deserto/sertão
        votes: 182,
        description: "Inspirado no espírito acolhedor do Ceará. O protetor dos bons processos: 'Calma que Padim Cesso resolve...'."
    }
];

let hasVoted = false;

function init() {
    renderCards();
}

function handleImageError(img, fallbackSrc) {
    // Evita loop infinito se a fallback também falhar
    if (img.src !== fallbackSrc) {
        img.src = fallbackSrc;
    }
}

function calculatePercentages() {
    const totalVotes = candidatesData.reduce((acc, curr) => acc + curr.votes, 0);
    return candidatesData.map(c => ({
        ...c,
        percentage: totalVotes === 0 ? 0 : Math.round((c.votes / totalVotes) * 100)
    }));
}

function renderCards() {
    const container = document.getElementById('cards-container');
    const dataWithPercentages = calculatePercentages();

    container.innerHTML = dataWithPercentages.map(candidate => `
        <article class="mascot-card" id="card-${candidate.id}">
            <div class="card-image-wrapper">
                <img 
                    src="${candidate.image}" 
                    alt="${candidate.name}" 
                    class="mascot-img" 
                    onerror="handleImageError(this, '${candidate.fallback}')"
                >
            </div>
            <div class="card-content">
                <h2 class="mascot-name">${candidate.name}</h2>
                <p class="mascot-desc">${candidate.description}</p>
                <button class="vote-btn" onclick="vote(${candidate.id})" id="btn-${candidate.id}">
                    Votar
                </button>
            </div>
        </article>
    `).join('');
}

// COLE A URL GERADA PELO GOOGLE APPS SCRIPT ABAIXO (entre as aspas):
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxaRKGyQSPteBq_ntIBit23CI_dquda9mWfA8J2E_gzGtkw7_1eBr3KHt-AsaQ298KDTA/exec";

function vote(id) {
    if (hasVoted) return;

    const candidateIndex = candidatesData.findIndex(c => c.id === id);
    if (candidateIndex !== -1) {
        const candidate = candidatesData[candidateIndex];

        // Se a pessoa esqueceu de colocar a URL do Google
        if (GOOGLE_SHEETS_URL === "") {
            console.warn("Aviso: Voto salvo apenas localmente. Acesse script.js e defina a GOOGLE_SHEETS_URL!");
            hasVoted = true;
            revealResults();
            return;
        }

        hasVoted = true;

        // Mudar botão para Loading
        const btn = document.getElementById(`btn-${candidate.id}`);
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
        btn.style.opacity = '0.7';

        // Requisição para a Planilha do Google MODO no-cors
        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: candidate.id,
                name: candidate.name,
                data: new Date().toISOString()
            })
        }).then(() => {
            // Sucesso
            revealResults();
        }).catch((error) => {
            console.error("Erro ao enviar voto: ", error);
            alert("Erro de conexão. Seu voto não pôde ser gravado.");
            hasVoted = false; // libere novamente
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
        });
    }
}

function revealResults() {
    const dataWithPercentages = calculatePercentages();

    // Mostrar banner de sucesso
    const banner = document.getElementById('results-banner');
    banner.classList.remove('hidden');

    // Desabilitar botões e revelar overlays
    dataWithPercentages.forEach(candidate => {
        const btn = document.getElementById(`btn-${candidate.id}`);
        btn.disabled = true;
        btn.innerHTML = 'Voto Encerrado';
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.style.background = '#444';

        const card = document.getElementById(`card-${candidate.id}`);
        card.classList.add('show-results');
    });
}

// Iniciar a aplicação
document.addEventListener('DOMContentLoaded', init);
