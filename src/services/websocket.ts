import { Dispatch } from '@reduxjs/toolkit';
import { updateCryptoPrice, setWsConnected, setError } from '../features/crypto/cryptoSlice';

class WebSocketService {
  private ws: WebSocket | null = null;
  private dispatch: Dispatch | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;

  initialize(dispatch: Dispatch, symbols: string[]) {
    this.dispatch = dispatch;
    this.connect(symbols);
  }

  private connect(symbols: string[]) {
    try {
      // Convert symbols to lowercase and create subscription string
      const streams = symbols.map(symbol => `${symbol.toLowerCase()}usdt@trade`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
        if (this.dispatch) {
          this.dispatch(setWsConnected(true));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === 'trade' && this.dispatch) {
            const symbol = data.s.replace('USDT', '').toLowerCase();
            const id = this.getCryptoIdFromSymbol(symbol);
            const price = parseFloat(data.p);

            this.dispatch(updateCryptoPrice({
              id,
              price,
              timestamp: data.T || Date.now()
            }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        if (this.dispatch) {
          this.dispatch(setWsConnected(false));
        }
        this.handleReconnect(symbols);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.dispatch) {
          this.dispatch(setError('WebSocket connection error'));
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect(symbols);
    }
  }

  private getCryptoIdFromSymbol(symbol: string): string {
    // Map Binance symbols to crypto IDs
    const symbolToId: { [key: string]: string } = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'bnb': 'binancecoin',
      'sol': 'solana',
      'ada': 'cardano'
    };
    return symbolToId[symbol.toLowerCase()] || symbol.toLowerCase();
  }

  private handleReconnect(symbols: string[]) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(symbols), this.reconnectTimeout);
    } else if (this.dispatch) {
      this.dispatch(setError('Unable to establish WebSocket connection after multiple attempts'));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;