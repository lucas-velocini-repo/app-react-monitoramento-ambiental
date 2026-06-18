import { useState, useEffect } from 'react';
import { Settings, User, Package, Search, X } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const tabs = [
  "Visão Geral", "Temperatura", "Pressão", 
  "Umidade", "Luminosidade", "Particulados PM",
  "Particulados NC", "Dados Históricos"
];

const chartDefinitions = {
  "Visão Geral": {
    params: ["temperature", "humidity"],
    labels: ["Temperatura (°C)", "Umidade (%)"],
    keys: ["temperature", "humidity"]
  },
  "Temperatura": {
    params: ["temperature"],
    labels: ["Temperatura (°C)"],
    keys: ["temperature"]
  },
  "Pressão": {
    params: ["pressure"],
    labels: ["Pressão (hPa)"],
    keys: ["pressure"]
  },
  "Umidade": {
    params: ["humidity"],
    labels: ["Umidade (%)"],
    keys: ["humidity"]
  },
  "Luminosidade": {
    params: ["light"],
    labels: ["Luminosidade (lux)"],
    keys: ["light"]
  },
  "Particulados PM": {
    params: ["pm_1_0", "pm_2_5", "pm_4_0", "pm_10_0"],
    labels: ["PM 1.0", "PM 2.5", "PM 4.0", "PM 10.0"],
    keys: ["pm_1_0", "pm_2_5", "pm_4_0", "pm_10_0"]
  },
  "Particulados NC": {
    params: ["nc_0_5", "nc_1_0", "nc_2_5", "nc_4_0", "nc_10_0"],
    labels: ["NC 0.5", "NC 1.0", "NC 2.5", "NC 4.0", "NC 10.0"],
    keys: ["nc_0_5", "nc_1_0", "nc_2_5", "nc_4_0", "nc_10_0"]
  }
};

function App() {
  const [devices, setDevices] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);
  const [botaoAtivo, setBotaoAtivo] = useState("Visão Geral");
  const [termoBusca, setTermoBusca] = useState("");
  const [abrirConfigurações, setAbrirConfigurações] = useState(false);
  const [urlServidor, setUrlServidor] = useState("/api");
  const [urlServidorTemp, setUrlServidorTemp] = useState("/api");

  const resolveUrl = (path) => {
    if (urlServidor.startsWith("http://") || urlServidor.startsWith("https://")) {
      return `${urlServidor}${path}`;
    }
    return `${urlServidor}${path}`;
  };

  const normalizeDevices = (rows) =>
    rows.map(([id, name, latitude, longitude, created_at]) => ({
      id,
      name,
      latitude,
      longitude,
      created_at
    }));

  const normalizeMeasurements = (rows) =>
    rows.map(([id, device_id, timestamp]) => ({
      id,
      device_id,
      timestamp
    }));

  const normalizeMeasurementValues = (rows) => {
    if (Array.isArray(rows)) {
      return rows.map((item) => {
        if (Array.isArray(item)) {
          const [parameter, value] = item;
          return { parameter, value };
        }
        return item;
      });
    }

    if (rows && typeof rows === 'object') {
      return Object.entries(rows).map(([parameter, value]) => ({
        parameter,
        value
      }));
    }

    return [];
  };

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  const buildTimeSeries = async (deviceId, parameter) => {
    const data = await fetchJson(resolveUrl(`/timeseries?device_id=${deviceId}&parameter=${encodeURIComponent(parameter)}&limit=50`));
    const timestamps = data.timestamps || [];
    const values = data.values || [];
    return timestamps.map((timestamp, index) => ({
      timestamp,
      [parameter]: values[index] ?? null
    }));
  };

  const loadHistoricalData = async (measurementRows, deviceList) => {
    const deviceMap = Object.fromEntries(deviceList.map((device) => [device.id, device.name]));

    const rows = await Promise.all(
      measurementRows.map(async (measurement) => {
        const valuesData = await fetchJson(resolveUrl(`/measurement/${measurement.id}`));
        const values = normalizeMeasurementValues(valuesData);

        const flattenedValues = values.length > 0
          ? Object.fromEntries(values.map((item) => [item.parameter, item.value]))
          : (valuesData && typeof valuesData === 'object' && !Array.isArray(valuesData)
            ? Object.entries(valuesData).reduce((acc, [key, value]) => {
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                  Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    acc[`${key} ${nestedKey}`] = nestedValue;
                  });
                } else {
                  acc[key] = value;
                }
                return acc;
              }, {})
            : {}
          );

        return {
          measurementId: measurement.id,
          deviceId: measurement.device_id,
          deviceName: deviceMap[measurement.device_id] || `Dispositivo ${measurement.device_id}`,
          timestamp: measurement.timestamp,
          values: flattenedValues
        };
      })
    );

    setHistoricalData(rows);
  };

  const loadServerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [devicesRaw, measurementsRaw] = await Promise.all([
        fetchJson(resolveUrl('/devices')),
        fetchJson(resolveUrl('/measurements'))
      ]);

      const parsedDevices = normalizeDevices(devicesRaw);
      const parsedMeasurements = normalizeMeasurements(measurementsRaw);

      setDevices(parsedDevices);
      setMeasurements(parsedMeasurements);

      if (!selectedDevice && parsedDevices.length > 0) {
        setSelectedDevice(parsedDevices[0]);
      }

      if (parsedMeasurements.length > 0) {
        await loadHistoricalData(parsedMeasurements, parsedDevices);
      } else {
        setHistoricalData([]);
      }
    } catch (err) {
      setError('Não foi possível acessar o servidor. Verifique a URL e se o backend está rodando.');
      setDevices([]);
      setMeasurements([]);
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };

  const mergeSeries = (seriesList) => {
    const mergedMap = new Map();

    seriesList.forEach((series) => {
      series.forEach((entry) => {
        const key = entry.timestamp;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, { timestamp: entry.timestamp });
        }

        Object.entries(entry).forEach(([field, value]) => {
          if (field !== 'timestamp') {
            mergedMap.get(key)[field] = value;
          }
        });
      });
    });

    return Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = Number(a.timestamp);
      const timeB = Number(b.timestamp);
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
        return timeA - timeB;
      }
      return String(a.timestamp).localeCompare(String(b.timestamp));
    });
  };

  const loadChartData = async (deviceId, currentTab) => {
    const definition = chartDefinitions[currentTab];
    if (!definition || currentTab === "Dados Históricos") {
      setChartData([]);
      return;
    }

    setLoadingChart(true);
    setError(null);

    try {
      const seriesList = await Promise.all(
        definition.params.map((param) => buildTimeSeries(deviceId, param))
      );
      setChartData(mergeSeries(seriesList));
    } catch (err) {
      setError('Falha ao carregar os dados do gráfico.');
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    loadServerData();
  }, [urlServidor]);

  useEffect(() => {
    if (!selectedDevice && devices.length > 0) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, selectedDevice]);

  useEffect(() => {
    if (selectedDevice) {
      loadChartData(selectedDevice.id, botaoAtivo);
    }
  }, [selectedDevice, botaoAtivo, urlServidor]);

  const modulosFiltrados = devices.filter((device) =>
    (device.name || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
    `${device.latitude}`.includes(termoBusca.toLowerCase()) ||
    `${device.longitude}`.includes(termoBusca.toLowerCase())
  );

  const limparBusca = () => setTermoBusca("");

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

  const lastDeviceMeasurement = selectedDevice
    ? measurements.filter((item) => item.device_id === selectedDevice.id).sort((a, b) => b.id - a.id)[0]
    : null;

  const formatModuleName = (name) =>
    (name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const formatTimestamp = (value) => {
    const parsed = Number(value);
    const date = new Date(Number.isNaN(parsed) ? value : parsed);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return value;
  };

  const getMetricValue = (values, candidates) => {
    for (const key of candidates) {
      if (values?.[key] !== undefined && values?.[key] !== null) {
        return values[key];
      }
    }
    return null;
  };

  const renderGrafico = (abaAtiva, modulo) => {
    if (!modulo) {
      return (
        <div className="empty-state">
          <Package size={64} color="#cbd5e1" />
          <h3>Selecione um Dispositivo</h3>
          <p>Clique em um dos dispositivos à esquerda para visualizar os dados e gráficos.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="chart-wrapper">
          <h3>Erro</h3>
          <div className="chart-placeholder">
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="chart-wrapper">
          <h3>Carregando dados do servidor...</h3>
          <div className="chart-placeholder">
            <p>Aguarde enquanto os dispositivos e medições são carregados.</p>
          </div>
        </div>
      );
    }

    if (abaAtiva === "Dados Históricos") {
      const selectedHistoricalData = historicalData.filter((item) => item.deviceId === modulo.id);
      const columns = selectedHistoricalData.length > 0
        ? ["Timestamp", ...Object.keys(selectedHistoricalData[0].values)]
        : ["Timestamp"];

      return (
        <div className="chart-wrapper">
          <h3>Dados Históricos</h3>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedHistoricalData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>Nenhum dado histórico encontrado para esta estação.</td>
                  </tr>
                ) : (
                  selectedHistoricalData.map((item) => (
                    <tr key={item.measurementId}>
                      <td>{formatTimestamp(item.timestamp)}</td>
                      {columns.slice(1).map((column) => (
                        <td key={`${item.measurementId}-${column}`}>{item.values[column] ?? '-'}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (abaAtiva === "Visão Geral") {
      const selectedHistoricalData = historicalData.filter((item) => item.deviceId === modulo.id);
      const latestReading = selectedHistoricalData[0] ?? null;
      const latestValues = latestReading?.values || {};

      const temperature = getMetricValue(latestValues, ['temperature', 'Temperatura']);
      const humidity = getMetricValue(latestValues, ['humidity', 'Umidade']);
      const pressure = getMetricValue(latestValues, ['pressure', 'Pressão']);
      const light = getMetricValue(latestValues, ['light', 'Luminosidade']);
      const pm25 = getMetricValue(latestValues, ['pm 2.5', 'pm_2_5']);
      const pm10 = getMetricValue(latestValues, ['pm 10.0', 'pm_10_0', 'pm 10']);
      const pm1 = getMetricValue(latestValues, ['pm 1.0', 'pm_1_0']);
      const pm4 = getMetricValue(latestValues, ['pm 4.0', 'pm_4_0']);
      const nc05 = getMetricValue(latestValues, ['nc 0.5', 'nc_0_5']);
      const nc10 = getMetricValue(latestValues, ['nc 1.0', 'nc_1_0']);
      const nc25 = getMetricValue(latestValues, ['nc 2.5', 'nc_2_5']);
      const nc40 = getMetricValue(latestValues, ['nc 4.0', 'nc_4_0']);
      const nc100 = getMetricValue(latestValues, ['nc 10.0', 'nc_10_0']);

      const overallData = selectedHistoricalData.map((item) => ({
        timestamp: item.timestamp,
        temperatura: getMetricValue(item.values, ['temperature', 'Temperatura']),
        umidade: getMetricValue(item.values, ['humidity', 'Umidade'])
      }));

      const particulateData = selectedHistoricalData.map((item) => ({
        timestamp: item.timestamp,
        pm25: getMetricValue(item.values, ['pm 2.5', 'pm_2_5']),
        pm10: getMetricValue(item.values, ['pm 10.0', 'pm_10_0', 'pm 10'])
      }));

      const qualityLabel = 'Ativa';
      const qualityClass = 'ativa';

      const pieData = [
        { name: 'PM 1.0', value: Number(pm1 || 0), color: '#0ea5e9' },
        { name: 'PM 2.5', value: Number(pm25 || 0), color: '#f59e0b' },
        { name: 'PM 4.0', value: Number(pm4 || 0), color: '#8b5cf6' },
        { name: 'PM 10.0', value: Number(pm10 || 0), color: '#dc2626' }
      ];

      const ncPieData = [
        { name: 'NC 0.5', value: Number(nc05 || 0), color: '#38bdf8' },
        { name: 'NC 1.0', value: Number(nc10 || 0), color: '#2563eb' },
        { name: 'NC 2.5', value: Number(nc25 || 0), color: '#14b8a6' },
        { name: 'NC 4.0', value: Number(nc40 || 0), color: '#a855f7' },
        { name: 'NC 10.0', value: Number(nc100 || 0), color: '#ef4444' }
      ];

      return (
        <div className="chart-wrapper overview-wrapper">
          <div className="overview-header">
            <div>
              <h3>Visão Geral da Estação</h3>
              <p className="overview-subtitle">Última atualização: {latestReading ? formatTimestamp(latestReading.timestamp) : 'Sem leitura'}</p>
            </div>
            <span className={`overview-status ${qualityClass}`}>{qualityLabel}</span>
          </div>

          <div className="overview-grid">
            <div className="overview-card primary">
              <span>Temperatura</span>
              <strong>{temperature !== null ? `${Number(temperature).toFixed(1)} °C` : '--'}</strong>
            </div>
            <div className="overview-card secondary">
              <span>Umidade</span>
              <strong>{humidity !== null ? `${Number(humidity).toFixed(1)} %` : '--'}</strong>
            </div>
            <div className="overview-card accent">
              <span>Pressão</span>
              <strong>{pressure !== null ? `${Number(pressure).toFixed(1)} hPa` : '--'}</strong>
            </div>
            <div className="overview-card neutral">
              <span>Luminosidade</span>
              <strong>{light !== null ? `${Number(light).toFixed(1)} lx` : '--'}</strong>
            </div>
          </div>

          <div className="overview-charts-grid">
            <div className="overview-chart-panel wide">
              <h4>Temperatura e Umidade</h4>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={overallData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#0056b3" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0056b3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => formatTimestamp(value)} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => formatTimestamp(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="temperatura" stroke="#0056b3" fill="url(#tempGradient)" name="Temperatura" />
                  <Line type="monotone" dataKey="umidade" stroke="#82ca9d" name="Umidade" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overview-pie-grid">
            <div className="overview-chart-panel">
              <h4>Distribuição PM</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="overview-chart-panel">
              <h4>Distribuição NC</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={ncPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {ncPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    if (loadingChart) {
      return (
        <div className="chart-wrapper">
          <h3>Atualizando gráfico</h3>
          <div className="chart-placeholder">
            <p>Aguarde enquanto o gráfico é carregado.</p>
          </div>
        </div>
      );
    }

    if (!chartData.length) {
      return (
        <div className="chart-wrapper">
          <h3>Dados não disponíveis</h3>
          <div className="chart-placeholder">
            <p>O servidor não retornou dados para este dispositivo e aba.</p>
          </div>
        </div>
      );
    }

    const definition = chartDefinitions[abaAtiva] || { keys: ["value"], labels: ["Valor"] };

    const titleMap = {
      "Visão Geral": "Visão Geral por tempo",
      "Temperatura": "Temperatura ao longo do tempo",
      "Pressão": "Pressão atmosférica",
      "Umidade": "Umidade relativa do ar",
      "Luminosidade": "Nível de luminosidade",
      "Particulados PM": "Material particulado",
      "Particulados NC": "Contagem de partículas NC"
    };

    return (
      <div className="chart-wrapper">
        <h3>{titleMap[abaAtiva] ?? abaAtiva}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            {definition.keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={index % 2 === 0 ? "#0056b3" : "#82ca9d"}
                name={definition.labels[index]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
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
              modulosFiltrados.map((device) => (
                <div 
                  key={device.id} 
                  className={`module-card ${selectedDevice?.id === device.id ? 'active' : ''}`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="card-image-frame">
                    <Package color="#0056b3" />
                  </div>
                  <div className="card-labels">
                    <span className="card-title">{formatModuleName(device.name || `Dispositivo ${device.id}`)}</span>
                    <span className="card-subtitle">
                      Lat {device.latitude?.toFixed(4) ?? 0}, Lon {device.longitude?.toFixed(4) ?? 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>
                  {loading
                    ? 'Carregando dispositivos...'
                    : error
                      ? 'Erro ao carregar dispositivos. Verifique se o backend está rodando.'
                      : 'Nenhum dispositivo encontrado'}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* DIREITA: Área de Conteúdo Central */}
        <main className="content-area">
          
          {/* Scroll Horizontal de Botões */}
          <div className="horizontal-menu-container">
            {tabs.map((btn, index) => (
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
            {selectedDevice && (
              <div className="module-header">
                <h2>Dispositivo: {formatModuleName(selectedDevice.name || `ID ${selectedDevice.id}`)}</h2>
                <p className="module-subtitle">
                  Última leitura: {lastDeviceMeasurement?.timestamp ?? 'Sem leituras'} • Lat {selectedDevice.latitude?.toFixed(4) ?? 0}, Lon {selectedDevice.longitude?.toFixed(4) ?? 0}
                </p>
              </div>
            )}
            {renderGrafico(botaoAtivo, selectedDevice)}
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
                  placeholder="/api ou http://127.0.0.1:8000"
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