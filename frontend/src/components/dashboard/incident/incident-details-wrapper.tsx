'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IncidentDetails } from './incident-details';
import { useRole } from '@/contexts/role-context';
import { useAztec } from '@/contexts/aztec-provider';
import { 
  usePolicyholderIncidentDetails,
  useInsurerIncidentDetails 
} from '@/lib/api';

interface IncidentDetailsWrapperProps {
  incidentId: string;
  companyId?: string;
}

export function IncidentDetailsWrapper({ 
  incidentId, 
  companyId 
}: IncidentDetailsWrapperProps): React.JSX.Element {
  const { role } = useRole();
  const { isConnected } = useAztec();

  // Fetch incident details based on role
  const {
    data: policyholderIncident,
    isLoading: isLoadingPolicyholder,
    error: policyholderError,
    refetch: refetchPolicyholderIncident
  } = usePolicyholderIncidentDetails(incidentId, {
    enabled: role === 'Policyholder' && isConnected && !!incidentId,
  });

  const {
    data: insurerIncident,
    isLoading: isLoadingInsurer,
    error: insurerError,
    refetch: refetchInsurerIncident
  } = useInsurerIncidentDetails(companyId || '', incidentId, {
    enabled: role === 'Insurer' && isConnected && !!companyId && !!incidentId,
  });

  // Handle incident update callback (for refetching after verification/generation)
  // MUST be called before any conditional returns to follow Rules of Hooks
  const handleIncidentUpdate = React.useCallback(async () => {
    if (role === 'Policyholder' && refetchPolicyholderIncident) {
      await refetchPolicyholderIncident();
    } else if (role === 'Insurer' && refetchInsurerIncident) {
      await refetchInsurerIncident();
    }
  }, [role, refetchPolicyholderIncident, refetchInsurerIncident]);

  // If Insurer but no companyId, show error
  if (role === 'Insurer' && !companyId && isConnected) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Missing Company ID
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Company ID is required to view incident details for Insurer role. Please navigate from the companies list.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const incident = role === 'Policyholder' ? policyholderIncident : insurerIncident;
  const isLoading = role === 'Policyholder' ? isLoadingPolicyholder : isLoadingInsurer;
  const error = role === 'Policyholder' ? policyholderError : insurerError;

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Please connect your wallet to view incident details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading incident details...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !incident) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading incident
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error instanceof Error ? error.message : 'Failed to load incident details'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Company name is included in API response for Insurer role
  // Extract it from the mapped data (it's added by mapper)
  type IncidentWithCompanyName = typeof incident & { companyName?: string };
  const incidentWithCompanyName = incident as IncidentWithCompanyName;
  const companyName = incidentWithCompanyName.companyName;

  // Remove companyName from incident object before passing (it's passed separately)
  const { companyName: _companyName, ...incidentData } = incidentWithCompanyName;

  // Ensure companyId is set for Insurer role (from URL params or incident data)
  if (role === 'Insurer' && companyId && !incidentData.companyId) {
    incidentData.companyId = companyId;
  }

  return <IncidentDetails incident={incidentData} companyName={companyName} onIncidentUpdate={handleIncidentUpdate} />;
}

