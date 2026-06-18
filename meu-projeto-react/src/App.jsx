import { useState } from 'react';
import { Settings, Bell, User, Activity, Package, Video, Sun, Search, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  // Dados para cada aba
  const dadosGraficos = {
    "Visão Geral": [
      { hora: "00:00", temperatura: 22, umidade: 65, pressao: 1013 },
      { hora: "04:00", temperatura: 20, umidade: 70, pressao: 1012 },
      { hora: "08:00", temperatura: 24, umidade: 60, pressao: 1014 },
      { hora: "12:00", temperatura: 28, umidade: 50, pressao: 1015 },
      { hora: "16:00", temperatura: 26, umidade: 55, pressao: 1013 },
      { hora: "20:00", temperatura: 23, umidade: 68, pressao: 1012 },
      { hora: "23:59", temperatura: 21, umidade: 72, pressao: 1011 }
    ],
    "Temperatura": [
      { hora: "00:00", valor: 22 },
      { hora: "04:00", valor: 20 },
      { hora: "08:00", valor: 24 },
      { hora: "12:00", valor: 28 },
      { hora: "16:00", valor: 26 },
      { hora: "20:00", valor: 23 },
      { hora: "23:59", valor: 21 }
    ],
    "Pressão": [
      { hora: "00:00", valor: 1013 },
      { hora: "04:00", valor: 1012 },
      { hora: "08:00", valor: 1014 },
      { hora: "12:00", valor: 1015 },
      { hora: "16:00", valor: 1013 },
      { hora: "20:00", valor: 1012 },
      { hora: "23:59", valor: 1011 }
    ],
    "Umidade": [
      { hora: "00:00", valor: 65 },
      { hora: "04:00", valor: 70 },
      { hora: "08:00", valor: 60 },
      { hora: "12:00", valor: 50 },
      { hora: "16:00", valor: 55 },
      { hora: "20:00", valor: 68 },
      { hora: "23:59", valor: 72 }
    ],
    "Luminosidade": [
      { hora: "00:00", valor: 0 },
      { hora: "06:00", valor: 150 },
      { hora: "12:00", valor: 800 },
      { hora: "15:00", valor: 900 },
      { hora: "18:00", valor: 200 },
      { hora: "21:00", valor: 10 },
      { hora: "23:59", valor: 0 }
    ],
    "Particulados PM": [
      { hora: "00:00", PM10: 25, PM2_5: 12 },
      { hora: "06:00", PM10: 45, PM2_5: 18 },
      { hora: "12:00", PM10: 35, PM2_5: 15 },
      { hora: "18:00", PM10: 50, PM2_5: 22 },
      { hora: "23:59", PM10: 30, PM2_5: 14 }
    ],
    "Particulados NC": [
      { hora: "00:00", valor: 1200 },
      { hora: "06:00", valor: 1800 },
      { hora: "12:00", valor: 1400 },
      { hora: "18:00", valor: 2000 },
      { hora: "23:59", valor: 1500 }
    ],
    "Dados Históricos": [
      { dia: "Seg", temp: 22, pressao: 1013, umidade: 65 },
      { dia: "Ter", temp: 23, pressao: 1012, umidade: 64 },
      { dia: "Qua", temp: 24, pressao: 1014, umidade: 62 },
      { dia: "Qui", temp: 25, pressao: 1015, umidade: 60 },
      { dia: "Sex", temp: 26, pressao: 1013, umidade: 58 },
      { dia: "Sab", temp: 24, pressao: 1012, umidade: 65 },
      { dia: "Dom", temp: 22, pressao: 1011, umidade: 68 }
    ]
  };

  // Função para renderizar o gráfico apropriado
  const renderGrafico = (abaAtiva, modulo) => {
    // Se nenhum módulo foi selecionado, mostrar mensagem
    if (!modulo) {
      return (
        <div className="empty-state">
          <Package size={64} color="#cbd5e1" />
          <h3>Selecione um Módulo</h3>
          <p>Clique em um dos módulos à esquerda para visualizar os dados e gráficos disponíveis</p>
        </div>
      );
    }

    // Se não for o primeiro módulo, mostrar gráfico vazio
    if (modulo.id !== 1) {
      return (
        <div className="chart-wrapper">
          <h3>Dados não disponíveis para {modulo.titulo}</h3>
          <div className="chart-placeholder">
            <p>Selecione o módulo "Estação Ambiental" para visualizar dados</p>
          </div>
        </div>
      );
    }
    
    const dados = dadosGraficos[abaAtiva];
    
    switch(abaAtiva) {
      case "Visão Geral":
        return (
          <div className="chart-wrapper">
            <h3>Visão Geral do Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperatura" stroke="#ff7300" name="Temperatura (°C)" />
                <Line type="monotone" dataKey="umidade" stroke="#8884d8" name="Umidade (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "Temperatura":
        return (
          <div className="chart-wrapper">
            <h3>Temperatura ao Longo do Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#ff7300" name="Temperatura (°C)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "Pressão":
        return (
          <div className="chart-wrapper">
            <h3>Pressão Atmosférica</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#82ca9d" name="Pressão (hPa)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "Umidade":
        return (
          <div className="chart-wrapper">
            <h3>Umidade Relativa do Ar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#8884d8" name="Umidade (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "Luminosidade":
        return (
          <div className="chart-wrapper">
            <h3>Índice de Luminosidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#ffc658" name="Luminosidade (lux)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "Particulados PM":
        return (
          <div className="chart-wrapper">
            <h3>Material Particulado em Suspensão</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="PM10" fill="#8884d8" name="PM10 (µg/m³)" />
                <Bar dataKey="PM2_5" fill="#82ca9d" name="PM2.5 (µg/m³)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "Particulados NC":
        return (
          <div className="chart-wrapper">
            <h3>Contagem de Partículas (NC)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#ff7300" name="Contagem (#/cm³)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "Dados Históricos":
        return (
          <div className="chart-wrapper">
            <h3>Histórico Semanal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temp" stroke="#ff7300" name="Temperatura (°C)" />
                <Line type="monotone" dataKey="umidade" stroke="#8884d8" name="Umidade (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Lista de módulos com dados de exemplo para a barra lateral esquerda
  const modulos = [
    { id: 1, icone: <Package color="#0056b3" />, titulo: "Estação Ambiental", subtitulo: "Coleta de dados" },
    { id: 2, icone: <Video color="#0056b3" />, titulo: "Câmeras IP - Carnaúba", subtitulo: "Stream de vídeo ativo" },
    { id: 3, icone: <Activity color="#0056b3" />, titulo: "Sensores do Sistema", subtitulo: "Status: Operacional" },
    { id: 4, icone: <Sun color="#0056b3" />, titulo: "Forno Solar", subtitulo: "Temperatura: 180°C" }
  ];

  // Lista de botões para o menu horizontal (com itens extras para demonstrar o scroll)
  const botoesHorizontais = [
    "Visão Geral", "Temperatura", "Pressão", 
    "Umidade", "Luminosidade", "Particulados PM",
    "Particulados NC", "Dados Históricos"
  ];

  const [botaoAtivo, setBotaoAtivo] = useState("Visão Geral");
  const [termoBusca, setTermoBusca] = useState("");
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [abrirConfigurações, setAbrirConfigurações] = useState(false);
  const [urlServidor, setUrlServidor] = useState("http://localhost:3001");
  const [urlServidorTemp, setUrlServidorTemp] = useState("http://localhost:3001");

  // Lógica de filtro para os módulos
  const modulosFiltrados = modulos.filter((mod) =>
    mod.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
    mod.subtitulo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Limpar a busca
  const limparBusca = () => setTermoBusca("");

  // Funções de configuração
  const abrirConfiguracoes = () => {
    setUrlServidorTemp(urlServidor);
    setAbrirConfigurações(true);
  };

  const fecharConfiguracoes = () => {
    setAbrirConfigurações(false);
  };

  const salvarConfiguracoes = () => {
    setUrlServidor(urlServidorTemp);
    setAbrirConfigurações(false);
  };

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
          {/*
          <button className="icon-btn" title="Notificações">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>
          */}
          <button className="icon-btn" title="Configurações" onClick={abrirConfiguracoes}>
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
                <div 
                  key={mod.id} 
                  className={`module-card ${moduloSelecionado?.id === mod.id ? 'active' : ''}`}
                  onClick={() => setModuloSelecionado(mod)}
                >
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
            {moduloSelecionado && (
              <div className="module-header">
                <h2>Módulo: {moduloSelecionado.titulo}</h2>
                <p className="module-subtitle">{moduloSelecionado.subtitulo}</p>
              </div>
            )}
            {renderGrafico(botaoAtivo, moduloSelecionado)}
          </div>
        </main>

      </div>

      {/* MODAL DE CONFIGURAÇÕES */}
      {abrirConfigurações && (
        <div className="modal-overlay" onClick={fecharConfiguracoes}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Configurações</h2>
              <button className="modal-close-btn" onClick={fecharConfiguracoes}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="config-section">
                <label htmlFor="url-servidor" className="config-label">URL do Servidor:</label>
                <input
                  id="url-servidor"
                  type="text"
                  className="config-input"
                  value={urlServidorTemp}
                  onChange={(e) => setUrlServidorTemp(e.target.value)}
                  placeholder="http://localhost:3000"
                />
                <p className="config-hint">Exemplo: http://192.168.1.100:3000</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={fecharConfiguracoes}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvarConfiguracoes}>
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;