🎨 Frontend Customization PDR: DataVault
Instructions for Workshop Participant:
Fill in the following sections to customize this template for your own project.
Replace the fields in the format [ENTER_HERE: description] with your own project information.

📋 Project Information
Selected Sector: Personal Data & Web3
Platform Name: DataVault
Main Asset Type: User-controlled Digital Footprints (e.g., browsing history, location data, shopping habits)
Target Audience:
Individual Users: People who want to control and monetize their personal data.

Companies & Researchers: Businesses, advertisers, and market researchers who need access to high-quality, ethically-sourced data.

🎯 Platform Vision
Main Concept
DataVault is a decentralized platform that empowers users to securely store their digital footprints in a personal, encrypted "data vault." It allows them to rent or sell anonymized access to this data to companies under their own terms, using smart contracts to ensure privacy, security, and fair compensation.

Value Proposition
For Individual Users: Regain full ownership and control over your personal data, protect your privacy, and create a new, passive income stream.

For Companies & Researchers: Access high-quality, consent-driven, and ethically-sourced data for market research, analytics, and advertising, while respecting user privacy.

🎨 Visual Identity Updates
Color Palette
/* Data & Security Theme */
--primary: #0052FF;      /* Main color - Represents trust and technology (a strong blue) */
--secondary: #00C49F;    /* Secondary color - Represents growth and ethics (a vibrant teal/green) */
--accent: #FFB800;       /* Accent color - For calls to action (a warm gold) */
--background: #F4F7FA;   /* Background - A very light, clean grey */
--foreground: #121B27;   /* Text color - A dark, readable slate grey */

Icons and Emojis
Main Theme: 🛡️ 📊 🔑 🔗 💰 👤 (Security, Data, Access, Blockchain, Monetization, Identity)

Data Categories: 🌐 (Browsing), 📍 (Location), 🛒 (Shopping), ❤️ (Interests),  demographics (🧑‍🤝‍🧑)

Actions: 📝 (Create Request), 💰 (Make Offer), 📈 (Analyze), 🔍 (Discover), ✅ (Approve), 🚀 (Execute)

Typography
Headlines: Inter

Content: Inter

Tone: Secure, empowering, and transparent.

📁 Files to be Updated
🏠 Home Page (app/page.tsx)
Title and Description
// Content to be updated:
title: "DataVault"
description: "Control your data. Monetize your digital footprint."

Dashboard Cards
// Metrics suitable for the data sector:
"Portfolio Value" → "Data Vault Value"
"Total Investment" → "Total Earnings"
"Active Assets" → "Active Data Streams"
"Compliance Status" → "Privacy Status"

Quick Actions
// Main platform actions:
"Discover Assets" → "Find Data Requests"
"Transfer Token" → "Grant Access"
"Tokenize Asset" → "Add Data to Vault"

🏪 Marketplace (app/marketplace/page.tsx)
Search and Filters
// Filters for the Personal Data sector:
asset_type: ["Browsing History", "Location Data", "Shopping Habits", "Interests"]
anonymity_level: ["Fully Anonymized", "Pseudonymized", "Aggregated"]
category: ["Market Research", "Academic Study", "Ad Targeting", "Product Analytics"]
certification: ["Verified Buyer", "Recurring Request"]

Asset Cards (Data Requests)
// Sample data request card:
{
  name: "Gen-Z Online Shopping Trends",
  symbol: "MKTR-01",
  creator: "Global Market Insights Inc.",
  date: "Request expires: 2025-12-31",
  specs: "Anonymized purchase data from users aged 18-25",
  price_per_token: "0.50", // price_per_access
  total_supply: 10000, // total_data_points_needed
  sold_percentage: 45 // fulfilled_percentage
}

Metrics
// Platform statistics adapted for the sector:
"Total Asset Value" → "Total Data Market Value"
"Active Investors" → "Active Data Buyers"
"Completed Transactions" → "Fulfilled Data Requests"

🌱 Tokenization (app/tokenize/page.tsx) (Now: "My Data Vault")
5-Step Process (for adding data)
// Process for adding a new data stream to the vault:

1. "Select Source"
   - [Connect a data source, e.g., browser extension, mobile app data]
   
2. "Set Privacy Rules"
   - [Define anonymization level, e.g., remove personal identifiers, aggregate location]
   
3. "Define Access Terms"
   - [Set rental price, usage duration, and purpose limitations]
   
4. "Review & Confirm"
   - [Review the data stream's settings and permissions]
   
5. "Activate Stream"
   - [Make the data stream available for requests on the marketplace]

💸 Transfer (app/transfer/page.tsx) (Now: "Permissions")
Transfer Terminology
// Terminology for granting data access:
"Token Transfer" → "Grant Data Access"
"Receiver Address" → "Data Buyer ID"
"Transfer Amount" → "Number of Access Grants"
"Compliance Check" → "Permission Check"

🎨 Layout (app/layout.tsx)
Metadata
export const metadata = {
  title: 'DataVault - Own Your Digital Footprint',
  description: 'A decentralized marketplace to securely control and monetize your personal data. Your data, your rules, your profit.',
  icons: {
    icon: '/favicon-datavault.ico', // A favicon representing a shield or a vault
  }
}

📱 Header (components/layout/Header.tsx)
Navigation Menu
// Menu items adapted for the sector:
"Dashboard" → "Dashboard"
"Marketplace" → "Data Marketplace"
"Tokenize" → "My Data Vault"
"Transfer" → "Permissions"

🔧 Technical Updates
Type Definitions (lib/types.ts)
// Type definitions suitable for the sector:
export interface DataAsset {
  id: string;
  name: string; // Name of the data request
  symbol: string; // Request symbol, e.g., MKTR-01
  asset_type: 'Browsing History' | 'Location Data' | 'Shopping Habits' | 'Interests';
  creator_info: { // Info about the data buyer
    name:string;
    industry: string;
    verified: boolean;
  };
  asset_details: { // Details of the data being requested
    description: string;
    anonymization_level: 'Fully Anonymized' | 'Pseudonymized';
    required_demographics: string;
    is_gdpr_compliant: boolean;
  };
  timeline_info: {
    request_date: string;
    expiry_date: string;
  };
  financial: {
    target_data_points: number;
    current_data_points: number;
    price_per_access: number; // Price per user data grant
    total_budget: number;
  };
}

Mock Data (lib/contract.ts)
// Sample mock data structure for a data request:
const SAMPLE_DATA_REQUESTS = [
  {
    id: 'req-mktr-01',
    name: 'Gen-Z Online Shopping Trends',
    symbol: 'MKTR-01',
    asset_type: 'Shopping Habits',
    creator_info: {
      name: 'Global Market Insights Inc.',
      industry: 'Market Research',
      verified: true,
    },
    // ... other details according to the DataAsset interface
  }
];

🎯 Agent Instructions for Application Customization
User Experience
✅ Customize the project to be as basic and bug-free as possible.

✅ Do not add new features; only update existing elements according to this PDR file and the provided prompt.

✅ The entire application must be in English.

✅ You don't need to update unnecessary parts; let's only update the parts visible on the frontend.

✅ Do not change the Rust code; only the frontend code will be customized. <- IMPORTANT!

✅ Develop the project to be as straightforward, basic, and error-free as possible.

📝 Implementation Checklist
Phase 1: Basic Customization
[x] Update titles and descriptions

[x] Change the color palette

[x] Adapt icons and emojis

[x] Update the navigation menu

[x] Adapt mock data to the sector

Phase 2: Advanced Content
[x] Customize dashboard widgets

[x] Expand marketplace filters

[x] Update type definitions

[x] Adapt the "Tokenization" flow (to "My Data Vault")

[x] Change the "Transfer" terminology (to "Permissions")

💡 Customization Tips
Quick Start
Terminology First: List all key terms (Data Vault, Data Stream, Access Grant).

Visual Identity: Define the color and icon palette.

User Journey: Map out the primary user flows (User adding data, Company requesting data).

Content Strategy: Plan the content hierarchy.

Common Mistakes
❌ To Avoid:

Trying to add too many new features.

You will only customize the existing RWA template for our project; you will not add new things.

Do not make any changes outside of the frontend.

Do not make any changes related to the wallet connection; that part is already working.

✅ What We Want:

A simple and focused design.

Only the Frontend will be updated.

No new features will be added; existing ones will be customized for our project.

🚀 🛡️ Bridging the gap from data silos to a user-owned data economy! 🛡️ 🚀

"Your Data. Your Rules. Your Profit."

This PDR template has been adapted to guide the creation of a Personal Data Marketplace (DataVault) platform. It offers a customizable and scalable structure tailored for the data economy.