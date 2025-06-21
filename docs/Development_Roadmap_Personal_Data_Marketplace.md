# Development Roadmap: Personal Data Marketplace

(Bu dosya orijinal olarak kök dizindeydi. Şimdi docs/ klasöründe.)

---

Based on the PDR.md file, this roadmap outlines the technical architecture, implementation phases, and strategies for building the DataVault Marketplace MVP.

1. Technical Architecture Decisions
Frontend: Next.js 14 (App Router). Chosen for its robust file-based routing, performance optimizations (RSCs), and strong TypeScript support.

Styling: Tailwind CSS. For rapid, utility-first development of a clean and responsive UI.

State Management: A combination of React Context API and Zustand.

Context API: For global, low-frequency updates like wallet connection status and user public key.

Zustand: For managing client-side state with more frequent updates, such as form data and UI state, to avoid context-related re-render issues.

Blockchain Interaction:

Wallet: @stellar/freighter-api will be wrapped in a custom React hook (useFreighter()) for easy access throughout the app.

Smart Contracts: A dedicated services/soroban.ts module will encapsulate all scval-rpc calls to interact with the deployed Soroban contract, providing a clean interface to the rest ofthe application.

Data Storage: IPFS via Pinata. A services/pinata.ts module will handle the client-side encryption (window.crypto.subtle) and API calls for uploading the encrypted data blobs.

Backend: None (Serverless-first). The architecture is intentionally backend-less for the MVP. The Next.js frontend communicates directly with the Stellar network and Pinata, maximizing decentralization.

2. Implementation Phases & Priorities
Phase 0: Project Foundation (Priority: Highest)

[ ] Initialize Next.js 14 project with TypeScript and Tailwind CSS.

[ ] Write and deploy the DataMarketplace Soroban contract to the Stellar Testnet. (Core functions: list_data, buy_data, get_asset).

[ ] Set up project structure: app/, components/, lib/, services/.

Phase 1: Core Producer Journey (Priority: High)

[ ] Implement the useFreighter hook for wallet connection and disconnection.

[ ] Build the main header component showing connection status and user address.

[ ] Create the "Sell Data" page (/sell).

[ ] Develop the DataUploadForm component with client-side encryption logic.

[ ] Integrate Pinata service for file upload.

[ ] Connect the form submission to the list_data Soroban function.

Phase 2: Core Consumer Journey (Priority: High)

[ ] Create the "Marketplace" page (/marketplace).

[ ] Fetch and display listed data sets using the get_asset Soroban function.

[ ] Create the DataCard component to display asset details.

[ ] Implement the purchase flow by calling the buy_data Soroban function on button click.

[ ] Build a "My Vault" page (/vault) to show data a user has listed or purchased.

Phase 3: UI/UX & Refinement (Priority: Medium)

[ ] Add comprehensive loading states for all async operations (form submission, data fetching).

[ ] Implement user feedback notifications (e.g., "File uploaded successfully," "Transaction failed") using a library like react-hot-toast.

[ ] Ensure the entire application is responsive and mobile-friendly.

[ ] Finalize the color scheme, typography, and iconography based on the PDR.

3. Integration Points & Dependencies
Freighter Wallet <-> Frontend: The most critical dependency. The app is non-functional without a connected wallet. All transaction-related buttons will be disabled until a user is connected.

Frontend <-> Soroban Contract: All core business logic depends on successful RPC calls to the Stellar Testnet. A robust error-handling layer is required in the soroban.ts service to manage network failures or contract errors.

Frontend <-> Pinata API: The data-listing feature is dependent on Pinata's API. This integration must handle potential upload failures gracefully.

4. Testing Strategy
Unit Tests (Vitest):

Test the client-side encryption/decryption logic.

Test utility functions (e.g., address truncation, price formatting).

Mock the Soroban service to test form submission logic without making actual network calls.

Integration Tests (React Testing Library):

Test the DataUploadForm to ensure it correctly handles user input, validation, and submission states.

Test the Marketplace page to ensure it correctly fetches and renders data from a mocked Soroban service.

End-to-End Tests (Playwright):

Happy Path: Simulate the full user journey: Connect Wallet -> List Data -> A second user Buys Data.

Failure Path: Test scenarios like insufficient funds for a purchase, rejecting a transaction in Freighter, and API failures.

5. Performance Optimization Checkpoints
Code Splitting: Use Next.js dynamic imports (next/dynamic) for large components or libraries that are not needed on the initial page load (e.g., the encryption library if it's heavy).

Asset Optimization: Use the built-in Next.js <Image> component for any static image assets to ensure they are properly sized and optimized.

Memoization: Apply React.memo to the DataCard component in the marketplace to prevent re-renders of the entire list when the data changes.

Bundle Analysis: After Phase 2, use @next/bundle-analyzer to inspect the JavaScript bundle sizes and identify any unexpectedly large dependencies.
