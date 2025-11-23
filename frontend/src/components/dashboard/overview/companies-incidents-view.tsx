'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LatestIncidents } from '@/components/dashboard/overview/latest-incidents';
import { LatestCompanies } from '@/components/dashboard/overview/latest-companies';
import { companies } from '@/data/dummy-data';
import { useRole } from '@/contexts/role-context';
import { useAztec } from '@/contexts/aztec-provider';
import { AzguardConnectButton } from '@/components/app-kit/AzguardConnectButton';
import { 
  useCompanyPortfolioWithCounts, 
  useCompanyIncidents,
  usePolicyholderIncidents 
} from '@/lib/api';

export function CompaniesIncidentsView(): React.JSX.Element {
  const { role } = useRole();
  const { isConnected, isConnecting } = useAztec();
  
  // Fetch companies from API for Insurer role (with incident counts)
  const { 
    data: apiCompaniesData,
    isLoading: isLoadingCompanies,
    error: companiesError 
  } = useCompanyPortfolioWithCounts({
    enabled: role === 'Insurer' && isConnected,
  });

  // Use API companies for Insurer, dummy data as fallback
  const companiesList = React.useMemo(() => {
    const apiCompanies = apiCompaniesData?.companies || [];
    if (role === 'Insurer' && apiCompanies.length > 0) {
      return apiCompanies;
    }
    return companies;
  }, [role, apiCompaniesData?.companies]);

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(companiesList[0]?.id || '');
  
  // Update selected company when companies list changes
  React.useEffect(() => {
    if (companiesList.length > 0 && !companiesList.some(c => c.id === selectedCompanyId)) {
      setSelectedCompanyId(companiesList[0].id);
    }
  }, [companiesList, selectedCompanyId]);

  // Fetch incidents from API
  // For Policyholder: fetch all incidents
  const {
    data: policyholderIncidents = [],
    isLoading: isLoadingPolicyholderIncidents,
    error: policyholderIncidentsError
  } = usePolicyholderIncidents({
    enabled: role === 'Policyholder' && isConnected,
  });

  // For Insurer: fetch incidents for selected company
  const {
    data: companyIncidents = [],
    isLoading: isLoadingCompanyIncidents,
    error: companyIncidentsError
  } = useCompanyIncidents(selectedCompanyId, {
    enabled: role === 'Insurer' && isConnected && !!selectedCompanyId,
  });

  // Build incidents count from API companies data (for Insurer)
  const incidentsCountByCompany = React.useMemo(() => {
    const apiCounts = apiCompaniesData?.counts || {};
    if (role === 'Insurer' && Object.keys(apiCounts).length > 0) {
      // Use incident_count from API
      return apiCounts;
    }
    
    // Fallback: return empty object if no API data
    return {};
  }, [role, apiCompaniesData?.counts]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  // Select incidents based on role
  const selectedIncidents = React.useMemo(() => {
    if (role === 'Policyholder') {
      return policyholderIncidents;
    }
    // For Insurer: filter out incidents without proof (only show 'Proof Not Verified' and 'ZK proof Verified')
    if (role === 'Insurer') {
      return companyIncidents.filter(incident => incident.status !== 'Need Proof');
    }
    return [];
  }, [role, policyholderIncidents, companyIncidents]);

  const isLoadingIncidents = role === 'Policyholder' 
    ? isLoadingPolicyholderIncidents 
    : isLoadingCompanyIncidents;
  const incidentsError = role === 'Policyholder'
    ? policyholderIncidentsError
    : companyIncidentsError;

  const selectedCompany = companiesList.find(c => c.id === selectedCompanyId);

  // Show placeholder if wallet is not connected
  if (!isConnected && !isConnecting) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent>
            <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
              <Typography variant="h5" align="center">
                Connect Wallet to Continue
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Please connect your Azguard Wallet to view incidents and manage your dashboard.
              </Typography>
              <Box sx={{ pt: 2 }}>
                <AzguardConnectButton />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // For Policyholder: show only incidents table, full width
  if (role === 'Policyholder') {
    if (isLoadingIncidents) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading incidents...
            </Typography>
          </Stack>
        </Box>
      );
    }

    if (incidentsError) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Error loading incidents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {incidentsError instanceof Error ? incidentsError.message : 'Failed to load incidents'}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid size={{ lg: 12, md: 12, xs: 12 }}>
          <LatestIncidents
            incidents={selectedIncidents}
            title="Your Incidents"
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    );
  }

  // For Insurer: show companies list + incidents table
  // Show loading state while fetching companies
  if (role === 'Insurer' && isLoadingCompanies) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading companies...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state if companies fetch failed
  if (role === 'Insurer' && companiesError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading companies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {companiesError instanceof Error ? companiesError.message : 'Failed to load companies'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
        <LatestCompanies
          companies={companiesList}
          selectedCompanyId={selectedCompanyId}
          onCompanySelect={handleCompanySelect}
          verifiedIncidentsCount={incidentsCountByCompany}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid
        size={{
          lg: 8,
          md: 12,
          xs: 12,
        }}
      >
        {isLoadingCompanyIncidents ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading incidents...
              </Typography>
            </Stack>
          </Box>
        ) : companyIncidentsError ? (
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Error loading incidents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {companyIncidentsError instanceof Error ? companyIncidentsError.message : 'Failed to load incidents'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <LatestIncidents
            incidents={selectedIncidents}
            companyName={selectedCompany?.name}
            companyId={selectedCompanyId}
            sx={{ height: '100%' }}
          />
        )}
      </Grid>
    </Grid>
  );
}

