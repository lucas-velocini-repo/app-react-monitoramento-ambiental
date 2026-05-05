import { useState } from 'react';
import { Settings, Bell, User, Activity, Package, Video, Sun, Search, X } from 'lucide-react';
import './App.css';

function App() {
  // Lista de módulos com dados de exemplo para a barra lateral esquerda
  const modulos = [
    { id: 1, icone: <Package color="#0056b3" />, titulo: "Estação Ambiental", subtitulo: "Coleta de dados" },
    { id: 2, icone: <Video color="#0056b3" />, titulo: "Câmeras IP - Carnaúba", subtitulo: "Stream de vídeo ativo" },
    { id: 3, icone: <Activity color="#0056b3" />, titulo: "Sensores do Sistema", subtitulo: "Status: Operacional" },
    { id: 4, icone: <Sun color="#0056b3" />, titulo: "Forno Solar", subtitulo: "Temperatura: 180°C" }
  ];

  // Lista de botões para o menu horizontal (com itens extras para demonstrar o scroll)
  const botoesHorizontais = [
    "Visão Geral", "Gráficos de Chuva", "Logs do Servidor", 
    "Controle de Parâmetros", "Exportar SQL", "Configurações de Rede",
    "Calibração", "Diagnóstico Rápido"
  ];

  const [botaoAtivo, setBotaoAtivo] = useState("Visão Geral");
  const [termoBusca, setTermoBusca] = useState("");

  // Lógica de filtro para os módulos
  const modulosFiltrados = modulos.filter((mod) =>
    mod.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    mod.subtitulo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Limpar a busca
  const limparBusca = () => setTermoBusca("");

  return (
    <div className="dashboard-container">
      {/* --- NAVBAR SUPERIOR --- */}
      <nav className="navbar">
        <div className="nav-left">
          {/* Espaço reservado caso queira colocar uma logo depois */}
          <div className="logo-placeholder"></div>
        </div>
        
        <div className="nav-center">
          <h1 className="nav-title">Interface de Monitoramento</h1>
        </div>
        
        <div className="nav-right">
          <button className="icon-btn" title="Notificações">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          <button className="icon-btn" title="Configurações">
            <Settings size={20} />
          </button>
          <div className="user-profile" title="Perfil do Usuário">
            <User size={20} color="#fff" />
          </div>
        </div>
      </nav>

      {/* --- ÁREA PRINCIPAL --- */}
      <div className="main-layout">
        
        {/* ESQUERDA: Lista de Módulos (Cards) */}
        <aside className="sidebar">
          {/* Barra de Busca */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={18} color="#718096" />
              <input
                type="text"
                placeholder="Buscar módulo..."
                className="search-input"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              {termoBusca && (
                <button 
                  className="search-clear-btn" 
                  onClick={limparBusca}
                  title="Limpar busca"
                >
                  <X size={16} color="#718096" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Cards Filtrados */}
          <div className="modules-list">
            {modulosFiltrados.length > 0 ? (
              modulosFiltrados.map((mod) => (
                <div key={mod.id} className="module-card">
                  <div className="card-image-frame">
                    {mod.icone}
                  </div>
                  <div className="card-labels">
                    <span className="card-title">{mod.titulo}</span>
                    <span className="card-subtitle">{mod.subtitulo}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>Nenhum módulo encontrado</p>
              </div>
            )}
          </div>
        </aside>

        {/* DIREITA: Área de Conteúdo Central */}
        <main className="content-area">
          
          {/* Scroll Horizontal de Botões */}
          <div className="horizontal-menu-container">
            {botoesHorizontais.map((btn, index) => (
              <button 
                key={index} 
                className={`scroll-btn ${botaoAtivo === btn ? 'active' : ''}`}
                onClick={() => setBotaoAtivo(btn)}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Espaço para o Conteúdo Real */}
          <div className="content-display">
            <h2>{botaoAtivo}</h2>
            <p>Selecione um módulo na esquerda ou navegue pelos botões acima para alterar esta visualização.</p>
            
            {/* Um quadrado de exemplo simulando um gráfico ou painel */}
            <div className="placeholder-panel">
              <Activity size={48} color="#cce5ff" />
              <p>Área reservada para visualização de dados</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}

export default App;