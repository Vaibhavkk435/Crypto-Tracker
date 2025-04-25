# Crypto Price Tracker

## Overview
A responsive React + Redux Toolkit application that tracks real-time cryptocurrency prices. The app displays detailed information about various cryptocurrencies including price changes, market cap, volume, and supply information in a clean, responsive table interface.

## Features
- Real-time price updates simulating WebSocket connections
- Responsive table display of 5 cryptocurrency assets (BTC, ETH, USDT, etc.)
- Detailed information for each asset:
  - Price with color-coded indicators for changes (green for positive, red for negative)
  - Price change percentages (1h, 24h, 7d)
  - Market capitalization
  - 24h trading volume
  - Circulating and maximum supply
  - 7-day price chart visualization
- Redux state management with optimized re-renders via selectors
- Responsive design that works across all devices

## Tech Stack
- *React* - UI library
- *Redux Toolkit* - State management
  - createSlice for reducer logic
  - configureStore for store setup
  - Selectors for optimized rendering performance
- *CSS/SCSS* - Styling
- *localStorage* - Persistent data storage (optional)

## Architecture
The application uses a modern Redux architecture with Redux Toolkit:


src/
├── components/       # React components
├── features/         # Feature-based modules
│   └── crypto/       # Cryptocurrency feature
│       ├── cryptoSlice.js        # Redux slice with reducers and actions
│       ├── cryptoSelectors.js    # Memoized selectors
│       └── cryptoAPI.js          # API/WebSocket simulation
├── app/
│   └── store.js      # Redux store configuration
├── utils/            # Helper functions
└── App.js            # Main application component


### State Management
- All asset data is stored in Redux
- Selectors are used to prevent unnecessary re-renders
- WebSocket updates are simulated with setInterval

## Setup Instructions

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation
1. Clone the repository
   bash
   git clone https://github.com/your-username/crypto-price-tracker.git
   cd crypto-price-tracker
   

2. Install dependencies
   bash
   npm install
   # or
   yarn install
   

3. Start the development server
   bash
   npm start
   # or
   yarn start
   

4. Open your browser and navigate to http://localhost:3000

## Usage
The application will automatically start displaying crypto price data when loaded. The data updates automatically to simulate real-time changes.

### Data Sources
This project uses sample cryptocurrency data that mimics the structure from popular APIs like CoinGecko or CoinMarketCap. In a production environment, you would integrate with a real API or WebSocket service.

## Demo
The demo shows:
- UI layout with the responsive table
- Live price updates with color indicators
- State flow as data changes
- 7-day chart visualization

## Tests
The application includes unit tests for:
- Redux reducers
- Selector functions
- WebSocket simulation behavior

Run tests with:
bash
npm test
# or
yarn test


## Optional Enhancements
- [x] Real WebSocket integration (e.g., with Binance)
- [x] Filtering and sorting options
- [x] Local storage for persistent settings
- [ ] Unit tests
- [ ] Type Script integration

## License
[MIT](LICENSE)
