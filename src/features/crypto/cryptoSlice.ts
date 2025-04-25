import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
  chartData: { price: number; timestamp: number }[];
  lastUpdate: number;
}

interface PriceUpdate {
  id: string;
  price: number;
  timestamp: number;
}

interface PriceHistory {
  [symbol: string]: {
    prices: { price: number; timestamp: number }[];
    basePrice1h: number;
    basePrice24h: number;
    basePrice7d: number;
    lastUpdateTime: { [key: string]: number };
  };
}

interface CryptoState {
  cryptos: CryptoData[];
  priceHistory: PriceHistory;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
}

const initialState: CryptoState = {
  cryptos: [],
  priceHistory: {},
  loading: false,
  error: null,
  wsConnected: false
};

const TIMEFRAMES = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000
};

const calculatePercentageChange = (currentPrice: number, basePrice: number): number => {
  if (!basePrice) return 0;
  const change = ((currentPrice - basePrice) / basePrice) * 100;
  return isFinite(change) ? Math.round(change * 100) / 100 : 0;
};

const getBasePrice = (chartData: { price: number; timestamp: number }[], timeframe: number): number => {
  const now = Date.now();
  const targetTime = now - timeframe;
  const relevantData = chartData.find(data => data.timestamp >= targetTime);
  return relevantData?.price || 0;
};

export const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    setCryptos: (state, action: PayloadAction<CryptoData[]>) => {
      state.cryptos = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
    updateCryptoPrice: (state, action: PayloadAction<PriceUpdate>) => {
      const crypto = state.cryptos.find(c => c.id.toLowerCase() === action.payload.id.toLowerCase());
      if (crypto) {
        const oldPrice = crypto.price;
        crypto.price = action.payload.price;
        
        // Update market cap based on new price
        crypto.marketCap = crypto.circulatingSupply * action.payload.price;
        
        // Add new price point to chart data
        crypto.chartData.push({
          price: action.payload.price,
          timestamp: action.payload.timestamp
        });

        // Keep only last 7 days of data
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        crypto.chartData = crypto.chartData.filter(data => data.timestamp >= sevenDaysAgo);

        // Sort chart data by timestamp
        crypto.chartData.sort((a, b) => a.timestamp - b.timestamp);

        // Calculate changes
        if (oldPrice > 0) {
          // Find base prices for different time periods
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

          const oneHourData = crypto.chartData.find(data => data.timestamp <= oneHourAgo);
          const twentyFourHourData = crypto.chartData.find(data => data.timestamp <= twentyFourHoursAgo);
          const sevenDayData = crypto.chartData.find(data => data.timestamp <= sevenDaysAgo);

          crypto.change1h = calculatePercentageChange(action.payload.price, oneHourData?.price || oldPrice);
          crypto.change24h = calculatePercentageChange(action.payload.price, twentyFourHourData?.price || oldPrice);
          crypto.change7d = calculatePercentageChange(action.payload.price, sevenDayData?.price || oldPrice);
        }
        
        crypto.lastUpdate = Date.now();
      }
    }
  },
});

export const { 
  setCryptos, 
  setLoading, 
  setError, 
  setWsConnected,
  updateCryptoPrice 
} = cryptoSlice.actions;

export default cryptoSlice.reducer; 