import type { DappMetadata } from '@azguardwallet/types';

// Aztec/Azguard Wallet Configuration
export const aztecConfig = {
  // Aztec chain identifier - can use 'devnet', 'sandbox', or CAIP-string
  defaultChain: process.env.NEXT_PUBLIC_AZTEC_CHAIN || 'devnet',
  
  // Application metadata
  metadata: {
    name: 'Hackaton Dashboard',
    description: 'Dashboard app for ETHGlobal Buenos Aires 2025',
    url: globalThis.window === undefined ? 'https://app.example.com' : globalThis.window.location.origin,
    logo: globalThis.window === undefined ? '/favicon.ico' : `${globalThis.window.location.origin}/favicon.ico`,
  } as DappMetadata,
};

