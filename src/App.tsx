import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './app/store';
import { setCryptos, CryptoData } from './features/crypto/cryptoSlice';
import wsService from './services/websocket';
import './App.css';

// Initial data for the supported cryptocurrencies
const initialCryptoData: CryptoData[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    price: 0,
    change1h: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 680000000000,
    volume24h: 28500000000,
    circulatingSupply: 19500000,
    maxSupply: 21000000,
    chartData: [],
    lastUpdate: Date.now()
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    price: 0,
    change1h: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 240000000000,
    volume24h: 15700000000,
    circulatingSupply: 120000000,
    maxSupply: null,
    chartData: [],
    lastUpdate: Date.now()
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    price: 0,
    change1h: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 47000000000,
    volume24h: 980000000,
    circulatingSupply: 153000000,
    maxSupply: 200000000,
    chartData: [],
    lastUpdate: Date.now()
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    price: 0,
    change1h: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 42000000000,
    volume24h: 2100000000,
    circulatingSupply: 410000000,
    maxSupply: null,
    chartData: [],
    lastUpdate: Date.now()
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    price: 0,
    change1h: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 15800000000,
    volume24h: 850000000,
    circulatingSupply: 35000000000,
    maxSupply: 45000000000,
    chartData: [],
    lastUpdate: Date.now()
  }
];

// Helper function to create SVG candlestick chart
const createSparkline = (data: { price: number; timestamp: number }[], color: string) => {
  const width = 160;
  const height = 50;
  const padding = 4;
  
  // Extract price values and filter out zero values
  const prices = data.map(d => d.price);
  const validPrices = prices.filter(val => val > 0);
  const max = validPrices.length > 0 ? Math.max(...validPrices) : 1;
  const min = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const range = max - min || 1;

  // Calculate trend lines
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((point.price - min) / range) * (height - 2 * padding);
    return { x, y, value: point.price };
  });

  // Create candlesticks
  const candlesticks = points.map((point, index, arr) => {
    if (index === 0) return ''; // Skip first point
    
    const prev = arr[index - 1];
    const isUp = point.value >= prev.value;
    const candleColor = isUp ? '%234caf50' : '%23f44336';
    const candleWidth = 2;
    
    return `
      <line 
        x1="${(point.x + prev.x) / 2}" 
        y1="${prev.y}" 
        x2="${(point.x + prev.x) / 2}" 
        y2="${point.y}" 
        stroke="${candleColor}" 
        stroke-width="${candleWidth}"
      />
    `;
  }).join('');

  // Create trend line
  const trendLine = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`
  ).join(' ');

  return `data:image/svg+xml;utf8,<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.2" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
      </linearGradient>
    </defs>
    
    <!-- Background gradient -->
    <path
      d="${trendLine} L ${width - padding},${height - padding} L ${padding},${height - padding} Z"
      fill="url(%23grad)"
      stroke="none"
    />
    
    <!-- Trend line -->
    <path
      d="${trendLine}"
      fill="none"
      stroke="${color}"
      stroke-width="1"
      stroke-opacity="0.5"
    />
    
    <!-- Candlesticks -->
    ${candlesticks}
  </svg>`;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { cryptos, wsConnected } = useSelector((state: RootState) => state.crypto);

  useEffect(() => {
    // Initialize with initial data
    const mutableData = initialCryptoData.map(crypto => ({
      ...crypto,
      chartData: [{
        price: crypto.price,
        timestamp: Date.now()
      }]
    }));
    
    // Create a new array to avoid readonly issues
    const cryptoArray: CryptoData[] = [...mutableData];
    dispatch(setCryptos(cryptoArray));

    // Connect to WebSocket
    const symbols = cryptoArray.map(crypto => crypto.symbol);
    wsService.initialize(dispatch, symbols);

    // Cleanup WebSocket connection on unmount
    return () => {
      wsService.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Tracker {wsConnected && <span className="live-indicator">LIVE</span>}</h1>
      </header>
      <div className="table-container">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>#</th>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th>Symbol</th>
              <th>Price</th>
              <th>1h %</th>
              <th>24h %</th>
              <th>7d %</th>
              <th>Market Cap</th>
              <th>24h Volume</th>
              <th>Circulating Supply</th>
              <th>Max Supply</th>
              <th>7D Chart</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto, index) => (
              <tr key={crypto.id}>
                <td>{index + 1}</td>
                <td className="name-cell">
                  <img 
                    src={crypto.logo} 
                    alt={`${crypto.name} logo`} 
                    className="crypto-logo"
                  />
                  <div className="crypto-name-container">
                    <span className="crypto-name">{crypto.name}</span>
                    <span className="crypto-symbol">{crypto.symbol}</span>
                  </div>
                </td>
                <td>{crypto.symbol}</td>
                <td>${formatNumber(crypto.price)}</td>
                <td className={`change-cell ${crypto.change1h >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.change1h > 0 ? '+' : ''}{crypto.change1h.toFixed(2)}%
                </td>
                <td className={`change-cell ${crypto.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                </td>
                <td className={`change-cell ${crypto.change7d >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.change7d > 0 ? '+' : ''}{crypto.change7d.toFixed(2)}%
                </td>
                <td>${formatNumber(crypto.marketCap)}</td>
                <td>${formatNumber(crypto.volume24h)}</td>
                <td>{formatNumber(crypto.circulatingSupply)} {crypto.symbol}</td>
                <td>{crypto.maxSupply ? formatNumber(crypto.maxSupply) : '∞'}</td>
                <td className="chart-cell">
                  <img 
                    src={createSparkline(crypto.chartData, crypto.change7d >= 0 ? '%234caf50' : '%23f44336')}
                    alt={`${crypto.name} 7-day chart`}
                    className="mini-chart"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

export default App; 