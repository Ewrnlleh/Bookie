# PDR (Product Definition & Requirements) - Bookie

(Bu dosya orijinal olarak kök dizindeydi. Şimdi docs/ klasöründe.)

---

1. Project Information
Sector: Decentralized Data Economy (DataFi / DePIN)

Platform Name: Bookie

Main Asset Type: User-owned, encrypted personal data sets (e.g., browsing history, location data, purchase history).

Target Audience:

Data Producers: Individuals who want to control their digital footprint and monetize it ethically.

Data Consumers: Researchers, startups, and companies seeking high-quality, consent-driven data for analysis and product development.

2. Platform Vision
Main Concept
Bookie is a decentralized platform built on the Stellar network that empowers individuals to take ownership of their digital data. Users can upload their data (e.g., from Google Takeout) to a secure, personal "Bookie vault," set their own terms for its use, and sell access to it directly to buyers in a transparent and private manner.

Value Proposition
For Data Producers (Users):

Sovereignty: True ownership and control over your personal data.

Monetization: Earn passive income directly from an asset you generate daily.

Privacy: Data is encrypted client-side, and you approve every transaction.

For Data Consumers (Companies):

Ethical Sourcing: Access high-quality, first-party data with explicit user consent.

Transparency: Clear terms and direct payment to the data owner, bypassing data brokers.

Efficiency: A direct marketplace to find specific, niche data sets.

3. User Personas & Journeys
Persona 1: "Alex" - The Data Producer
Description: A 28-year-old tech-savvy freelancer who is concerned about online privacy but also understands the value of data.

Goal: To stop giving away data for free and create a small, passive income stream.

User Journey Flow:

Onboarding: Alex lands on the Bookie homepage and connects their Freighter wallet.

Data Acquisition: Alex goes to Google Takeout and downloads their "My Activity" data as a .json file.

Listing Data:

Navigates to the "Sell Data" page on Bookie.

Uploads the My Activity.json file.

The platform encrypts the file client-side.

Alex sets a price (e.g., 100 XLM) and a description ("3 months of anonymized browsing data").

Approves the transaction to list the data set on the marketplace.

Sale & Payout:

Alex receives a notification that their data set has been sold.

Checks their wallet and sees the 100 XLM has been automatically deposited.

Persona 2: "Insight Corp" - The Data Consumer
Description: A market research startup analyzing consumer trends in sustainable products.

Goal: To acquire authentic, anonymized data about users interested in eco-friendly brands.

User Journey Flow:

Onboarding: The lead researcher connects the company's Freighter wallet.

Discovery: Navigates to the "Marketplace" and filters for "browsing history" and "shopping" data types.

Purchase:

Finds Alex's data set, which matches their criteria.

Clicks "Buy" and reviews the price and terms.

Approves the payment transaction in their wallet.

Data Access:

The smart contract finalizes the sale.

Insight Corp receives access to the IPFS CID of the encrypted file and the decryption key.

They download the data for their internal analysis.

4. Business Logic & Rules
Encryption: All user data MUST be encrypted in the browser (client-side) before being uploaded to IPFS. The platform never sees unencrypted user data.

Immutability: Once a data set is listed, its price and IPFS link cannot be changed. It can only be delisted by the owner.

Transactions: All sales are atomic. The payment from the buyer and the release of the data access information to the buyer happen in a single, smart-contract-governed transaction.

Platform Fee: The smart contract will take a 2.5% fee from every successful sale to fund platform maintenance.

Data Integrity: Data sets are represented by their IPFS CID, ensuring the data the buyer receives is the exact data the seller listed.

5. Technical Constraints & Success Metrics
Technical Stack & Constraints (MVP)
Framework: Next.js 14 (App Router) with TypeScript.

Styling: Tailwind CSS.

Blockchain: Stellar (Testnet for MVP) with Soroban smart contracts.

Wallet: Freighter integration is the primary connection method.

Storage: IPFS via Pinata for off-chain, decentralized storage of encrypted data.

Scope: The MVP will focus on the manual upload journey. A browser extension for automatic data collection is a future phase.

Success Metrics (First 6 Months)
Activation: Achieve 1,000+ active Bookie vaults (users who have listed at least one data set).

Transaction Volume: Facilitate over 500 successful data sale transactions.

User Payouts: Pay out a total of over 50,000 XLM to data producers.

User Satisfaction: Maintain a positive feedback score from both producers and consumers regarding ease of use and platform trust.
