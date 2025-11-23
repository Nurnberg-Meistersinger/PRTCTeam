# Dashboard Hackathon

This repository contains the solution for **ETHGlobal Buenos Aires 2025**.

A modern dashboard application built with Next.js, React, and Material-UI for managing companies and incidents with ZK proof verification.

## Features

- **Companies Management** - View and manage company information with logos
- **Incidents Tracking** - Track incidents with ZK proof verification status
- **Web3 Integration** - Connect wallet using Aztec Wallet (Azguard)

## Quick Start

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Configure Aztec network (optional, defaults to devnet)
```

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Library:** [Material-UI (MUI)](https://mui.com/)
- **Web3:** [Aztec Wallet](https://aztec.network/) ([Azguard](https://azguard.app/))
- **Language:** TypeScript
- **Styling:** Emotion

## Project Structure

```
hackaton-dashboard/
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── CHANGELOG.md
├── LICENSE.md
├── next.config.ts
├── package.json
├── README.md
├── tsconfig.json
├── public/
│   └── assets/
│       ├── logo-*.png
│       └── ...
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── dashboard/
    │       ├── page.tsx
    │       ├── layout.tsx
    │       ├── account/
    │       ├── customers/
    │       ├── integrations/
    │       └── settings/
    ├── components/
    │   ├── app-kit/
    │   ├── core/
    │   └── dashboard/
    │       ├── layout/
    │       └── overview/
    │           ├── latest-companies.tsx
    │           └── latest-incidents.tsx
    ├── config/
    ├── contexts/
    │   ├── aztec-provider.tsx
    │   └── role-context.tsx
    ├── hooks/
    ├── lib/
    ├── styles/
    └── types/
```

## License

Licensed under [MIT](LICENSE.md)
