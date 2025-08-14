// Configuração do Supabase para o site público
const SUPABASE_URL = 'https://umrommmfpnusthnjrlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcm9tbW1mcG51c3RobmpybHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzQ0NTMsImV4cCI6MjA3MDc1MDQ1M30.2YicCLgBDtJUtONBX4IjJKA8mrLkkpRIhEgiVJrf16g';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Inicializa o ScrollReveal
ScrollReveal({
    distance: '50px',
    duration: 1000,
    easing: 'ease-in-out',
    origin: 'bottom',
});

// Animação para a Hero Section
ScrollReveal().reveal('.hero-content h1, .hero-content p, .cta-button', {
    interval: 150,
    origin: 'top',
});

// Animação para as demais seções
ScrollReveal().reveal('.servicos-section h2, .servicos-grid', { delay: 200, reset: true });
ScrollReveal().reveal('.portfolio-section h2, .portfolio-categorias', { delay: 200, reset: true });
ScrollReveal().reveal('.portfolio-grid', { delay: 400, reset: true });
ScrollReveal().reveal('.sobre-nos-section h2, .sobre-nos-section p', { delay: 200, reset: true });
ScrollReveal().reveal('.contato-section h2, #contato-form, .contato-info', { delay: 200, reset: true });

// Elementos do portfólio
const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioCategorias = document.querySelector('.portfolio-categorias');

// Funcionalidade do Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const closeBtn = document.querySelector('.close-btn');

// Abre o lightbox ao clicar em uma imagem do portfólio
portfolioGrid.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        lightbox.style.display = 'flex';
        lightboxImage.src = e.target.src;
    }
});

// Fecha o lightbox ao clicar no botão "x"
closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// Fecha o lightbox ao clicar fora da imagem
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

// Função para buscar e exibir os itens do portfólio
async function fetchPortfolioItems() {
    const { data: items, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar itens do portfólio:', error);
        return;
    }

    displayPortfolioItems(items);
    createCategoryButtons(items);
}

// Função para exibir os itens na grade do portfólio
function displayPortfolioItems(items) {
    portfolioGrid.innerHTML = '';
    items.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.classList.add('portfolio-item');
        portfolioItem.setAttribute('data-category', item.category);

        const image = document.createElement('img');
        image.src = item.image_url;
        image.alt = item.title;

        portfolioItem.appendChild(image);
        portfolioGrid.appendChild(portfolioItem);
    });
}

// Função para criar os botões de categoria
function createCategoryButtons(items) {
    const uniqueCategories = ['Todos', ...new Set(items.map(item => item.category))];
    portfolioCategorias.innerHTML = ''; // Limpa os botões existentes

    uniqueCategories.forEach((category, index) => {
        const button = document.createElement('button');
        button.textContent = category;
        button.setAttribute('data-category', category); // Adiciona um data-attribute para o filtro

        if (index === 0) { // O primeiro botão será sempre "Todos" e ativo
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => filterByCategory(category));
        portfolioCategorias.appendChild(button);
    });
}

// Função para filtrar o portfólio por categoria
function filterByCategory(category) {
    const allItems = document.querySelectorAll('.portfolio-item');
    
    document.querySelectorAll('.portfolio-categorias button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.portfolio-categorias button[data-category="${category}"]`)?.classList.add('active');

    allItems.forEach(item => {
        if (category === 'Todos' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

fetchPortfolioItems();