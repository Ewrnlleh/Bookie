# 📚 Bookie - Decentralized Data Marketplace

![Bookie Logo](frontend/public/bookie-logo.png)

A decentralized marketplace built on Stellar blockchain where users can monetize their personal data while maintaining complete privacy and ownership control.

## 🌟 Overview

Bookie empowers individuals to take control of their digital footprint by providing a secure platform to upload, encrypt, and monetize personal data. Built with privacy-first principles, all data is encrypted client-side before upload, ensuring complete user control.

## ✨ Key Features

- 🔐 **Privacy First**: Client-side encryption ensures your data remains private
- 💰 **Data Monetization**: Earn from your personal data through secure transactions
- 🛡️ **Blockchain Security**: Built on Stellar network for transparent, secure transactions
- 🔑 **Freighter Wallet**: Simple, secure wallet integration (passkey auth removed)
- 📱 **Modern UI**: Responsive design with beautiful, intuitive interface
- 🌐 **Decentralized**: No central authority controls your data
- ⚡ **Simplified Architecture**: Streamlined codebase for easy maintenance and extension

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS with Radix UI components
- **Wallet Integration**: Freighter-only (simplified from complex auth system)
- **State Management**: React Context API with client-side only operations
- **Blockchain Integration**: Dynamic Stellar SDK imports for SSR compatibility

### Smart Contract (Rust/Soroban)
- **Platform**: Stellar Soroban smart contracts
- **Language**: Rust
- **Features**: Data tokenization, marketplace transactions, secure transfers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Rust and Cargo
- Stellar CLI (soroban-cli)
- Freighter browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bookie.git
   cd bookie
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Deploy smart contract** (optional)
   ```bash
   cd ../contracts/bookie
   ./deploy.sh
   ```

The application will be available at `http://localhost:3000`

## 🔧 Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_BOOKIE_CONTRACT_ID=your_contract_id_here
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY_URL=your_pinata_gateway_url
```

## 📁 Project Structure

```
bookie001/
├── contracts/              # Stellar Soroban smart contracts
│   └── bookie/
│       ├── src/            # Contract source code
│       ├── Cargo.toml      # Rust dependencies
│       └── deploy.sh       # Deployment scripts
├── frontend/               # Next.js application
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities and contexts
│   ├── services/           # External service integrations
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🔑 Authentication

### Freighter Wallet
- Browser extension for Stellar network
- Secure transaction signing
- Network management
- Simple one-click connection

## 💻 Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Smart Contract
```bash
./deploy.sh        # Deploy to Stellar network
./test.sh          # Run contract tests
cargo test         # Run Rust tests
```

## 🧪 Testing

### Built-in Testing
The application includes comprehensive testing capabilities through:
- Wallet connection validation
- Transaction flow verification  
- Error handling and recovery
- Real-time status monitoring

### Development Testing
- Component-level testing with TypeScript
- Smart contract testing with Rust
- Integration testing for blockchain interactions

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Stellar SDK** - Blockchain integration
- **Freighter API** - Wallet connectivity

### Backend/Blockchain
- **Stellar Soroban** - Smart contract platform
- **Rust** - Systems programming language
- **IPFS/Pinata** - Decentralized file storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🔐 Security Features

- **Client-side Encryption**: Data encrypted before upload
- **Blockchain Verification**: All transactions on Stellar network
- **Secure Wallet Integration**: Freighter wallet for transaction signing
- **Zero-knowledge Architecture**: Platform cannot access user data

## 📊 Key Pages

- **`/`** - Landing page with feature overview
- **`/marketplace`** - Browse and purchase data assets
- **`/sell`** - Upload and tokenize your data
- **`/vault`** - Manage your data assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Network Information

- **Testnet RPC**: https://soroban-testnet.stellar.org
- **Mainnet RPC**: https://soroban-mainnet.stellar.org
- **Network Passphrase**: Test SDF Network ; September 2015

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/bookie/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/bookie/wiki)
- **Community**: [Discussions](https://github.com/your-username/bookie/discussions)

## 🚨 Status

This project is actively maintained and under development. Current status:

- ✅ Core marketplace functionality
- ✅ Wallet integration (Freighter)
- ✅ Smart contract deployment
- ✅ Data encryption/decryption
- ✅ Transaction processing
- 🔄 Enhanced UI/UX improvements

## 🔮 Roadmap

- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-chain support
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Advanced privacy features

---

**Built with ❤️ for a more private, user-controlled internet.**
