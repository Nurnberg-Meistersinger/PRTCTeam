# API Client

This directory contains the API client for the Protectorium MVP API.

## Structure

- `types.ts` - TypeScript types based on OpenAPI specification
- `client.ts` - API client functions for all endpoints
- `hooks.ts` - React Query hooks for data fetching
- `mappers.ts` - Mappers to convert API types to application types
- `config.ts` - API configuration (base URL, timeout, etc.)
- `index.ts` - Barrel export for convenient imports

## Usage

### Using Hooks (Recommended)

```typescript
import { usePolicyholderIncidents, useGenerateProof } from '@/lib/api';

function MyComponent() {
  const { data: incidents, isLoading } = usePolicyholderIncidents();
  const generateProofMutation = useGenerateProof();

  const handleGenerate = async (incidentId: string) => {
    await generateProofMutation.mutateAsync(incidentId);
  };

  // ...
}
```

### Using Client Directly

```typescript
import { getPolicyholderIncidents, generateProof } from '@/lib/api';

async function fetchData() {
  const incidents = await getPolicyholderIncidents();
  await generateProof('20250101-0001');
}
```

## Configuration

API base URL is configured in `src/lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://api.protectorium.com',
  timeout: 30000,
} as const;
```

## Endpoints

### Policyholder
- `GET /incidents` - List incidents
- `GET /incident/{incidentId}` - Get incident details
- `POST /incident/{incidentId}/generate-proof` - Generate proof

### Insurer
- `GET /company/incidents/list` - List companies portfolio
- `GET /company/{companyId}/incidents` - List company incidents
- `GET /company/{companyId}/incident/{incidentId}` - Get incident details
- `POST /company/{companyId}/incident/{incidentId}/verify` - Verify proof

