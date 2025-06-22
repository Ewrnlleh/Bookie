# Freighter Wallet Integration

Bu proje Stellar blokzinciri için **Freighter Wallet** ve **Passkey** kimlik doğrulama entegrasyonu içerir.

## 🔧 Kurulum

### 1. Freighter Wallet Kurulumu

1. [Freighter resmi sitesinden](https://freighter.app/) tarayıcı uzantısını indirin
2. Chrome Web Store'dan veya Firefox Add-ons'tan yükleyin
3. Yeni bir wallet oluşturun veya mevcut bir wallet'ı import edin
4. Futurenet test ağını etkinleştirin

### 2. Proje Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## 🎯 Özellikler

### Desteklenen Wallet Türleri

- **Freighter Wallet** (Önerilen)
  - Tam Stellar ekosistemi desteği
  - Güvenli transaction imzalama
  - Otomatik ağ yönetimi

- **Passkey Authentication**
  - Cihaz donanımı tabanlı güvenlik
  - Touch ID, Face ID, Windows Hello desteği
  - Kurulum gerektirmez

### Wallet Özellikleri

- 🔄 Otomatik bağlantı algılama
- 💾 Bağlantı durumu saklama
- 🔐 Güvenli transaction imzalama
- 🔄 Çoklu wallet desteği
- 📱 Responsive tasarım

## 🚀 Kullanım

### Wallet Bağlama

```tsx
import { WalletConnect } from "@/components/wallet-connect"
import { useWallet } from "@/lib/wallet-context"

function MyComponent() {
  const { isConnected, publicKey, walletType } = useWallet()
  
  return (
    <div>
      <WalletConnect />
      {isConnected && (
        <p>Connected with {walletType}: {publicKey}</p>
      )}
    </div>
  )
}
```

### Transaction İmzalama

```tsx
const { signAndSubmitTransaction } = useWallet()

const handleTransaction = async () => {
  try {
    const result = await signAndSubmitTransaction(transactionXdr)
    console.log("Transaction hash:", result.hash)
  } catch (error) {
    console.error("Transaction failed:", error)
  }
}
```

## 🔧 API Referansı

### WalletContext

```tsx
interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  walletType: 'freighter' | 'passkey' | null
  connect: (walletType?: WalletType) => Promise<void>
  disconnect: () => void
  signAndSubmitTransaction: (txXdr: string) => Promise<{ hash: string }>
}
```

### WalletConnect Component

```tsx
interface WalletConnectProps {
  trigger?: React.ReactNode  // Özel trigger button
  onConnect?: () => void     // Bağlantı sonrası callback
}
```

## 🧪 Test

Wallet entegrasyonunu test etmek için `/wallet-test` sayfasını ziyaret edin:

```
http://localhost:3000/wallet-test
```

Bu sayfa şunları test eder:
- Wallet bağlantısı
- Public key görüntüleme
- Transaction imzalama
- Hata yönetimi

## 🔒 Güvenlik

### Freighter
- Private key'ler tarayıcı uzantısında saklanır
- Transaction'lar kullanıcı onayı ile imzalanır
- Network parametreleri doğrulanır

### Passkey
- Biometric doğrulama gerekir
- Private key'ler cihaz donanımında saklanır
- WebAuthn standardı kullanılır

## 🌐 Ağ Yapılandırması

Environment değişkenleri (`.env.local`):

```bash
# Kontrat adresi (deploy sonrası güncelleyin)
NEXT_PUBLIC_BOOKIE_CONTRACT_ID=YOUR_CONTRACT_ID

# Soroban RPC endpoint
NEXT_PUBLIC_SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
```

### Desteklenen Ağlar

- **Futurenet** (Test): `https://rpc-futurenet.stellar.org`
- **Testnet**: `https://rpc-testnet.stellar.org`
- **Mainnet**: `https://rpc-mainnet.stellar.org`

## 🐛 Sorun Giderme

### Freighter Bağlanamıyor
1. Uzantının yüklü ve etkin olduğunu kontrol edin
2. Website'e izin verildiğini doğrulayın
3. Doğru ağda olduğunuzdan emin olun

### Passkey Çalışmıyor
1. Tarayıcınızın WebAuthn desteklediğini kontrol edin
2. HTTPS bağlantısı kullandığınızdan emin olun
3. Cihazınızda biometric özellikler aktif mi?

### Transaction Başarısız
1. Yeterli XLM bakiyeniz var mı?
2. Kontrat adresi doğru mu?
3. Network passhrase'i eşleşiyor mu?

## 📚 Daha Fazla Bilgi

- [Freighter Dokümantasyonu](https://docs.freighter.app/)
- [Stellar SDK Dokümantasyonu](https://stellar.github.io/js-stellar-sdk/)
- [Soroban Dokümantasyonu](https://soroban.stellar.org/)
- [WebAuthn Standardı](https://webauthn.guide/)
