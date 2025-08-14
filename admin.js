// Substitua estas chaves pelas suas chaves do Supabase
const SUPABASE_URL = 'https://umrommmfpnusthnjrlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcm9tbW1mcG51c3RobmpybHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzQ0NTMsImV4cCI6MjA3MDc1MDQ1M30.2YicCLgBDtJUtONBX4IjJKA8mrLkkpRIhEgiVJrf16g';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos do HTML
const loginForm = document.getElementById('login-form');
const adminDashboard = document.getElementById('admin-dashboard');
const loginSection = document.getElementById('login-section');
const logoutBtn = document.getElementById('logout-btn');
const uploadForm = document.getElementById('upload-form');
const portfolioList = document.getElementById('portfolio-items-list');
const errorMessage = document.getElementById('error-message');

// Funções de Autenticação
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        fetchPortfolioItems();
    } else {
        loginSection.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Tenta fazer o login
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
        // Se o login falhar, tenta criar um novo utilizador
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        
        if (signUpError) {
            errorMessage.textContent = 'Erro ao entrar ou registar. Verifique as credenciais ou as configurações.';
            console.error('Erro ao registar ou entrar:', signUpError);
        } else {
            // Sucesso no registo
            errorMessage.textContent = 'Verifique seu email para confirmar o registo.';
            alert('Utilizador criado com sucesso! Por favor, verifique seu email para confirmar o registo antes de tentar entrar.');
        }
    } else {
        // Sucesso no login
        errorMessage.textContent = '';
        checkUser();
    }
});


logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    checkUser();
});

// Funções do Dashboard
async function fetchPortfolioItems() {
    const { data, error } = await supabase.from('portfolio_items').select('*');
    if (error) {
        console.error('Erro ao buscar itens:', error);
        return;
    }
    portfolioList.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.title} (${item.category})</span>
            <button onclick="deleteItem('${item.id}', '${item.image_url}')">Remover</button>
        `;
        portfolioList.appendChild(li);
    });
}

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('image-title').value;
    const category = document.getElementById('image-category').value;
    const fileInput = document.getElementById('image-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
    }

    // Fazer upload da imagem para o Supabase Storage
    const filePath = `public/${title}-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: storageData, error: storageError } = await supabase.storage
        .from('portfolio_images')
        .upload(filePath, file);

    if (storageError) {
        console.error('Erro no upload:', storageError);
        alert('Erro ao fazer upload da imagem.');
        return;
    }

    const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(filePath);

    // Inserir os dados na tabela do Supabase
    const { error: dbError } = await supabase.from('portfolio_items').insert([
        { title: title, category: category, image_url: publicUrl }
    ]);

    if (dbError) {
        console.error('Erro ao salvar no banco de dados:', dbError);
        alert('Erro ao salvar no banco de dados.');
    } else {
        alert('Imagem adicionada com sucesso!');
        uploadForm.reset();
        fetchPortfolioItems();
    }
});

async function deleteItem(id, imageUrl) {
    const confirmation = confirm('Tem certeza que deseja remover este item?');
    if (!confirmation) return;

    // Remover do banco de dados
    const { error: dbError } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (dbError) {
        console.error('Erro ao remover do banco de dados:', dbError);
        alert('Erro ao remover do banco de dados.');
        return;
    }

    // Remover do Storage
    const filePath = imageUrl.split('portfolio_images/')[1];
    const { error: storageError } = await supabase.storage.from('portfolio_images').remove([filePath]);
    if (storageError) {
        console.error('Erro ao remover do storage:', storageError);
    }

    alert('Item removido com sucesso!');
    fetchPortfolioItems();
}

checkUser();