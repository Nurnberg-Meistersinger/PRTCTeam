'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import { LatestIncidents } from '@/components/dashboard/overview/latest-incidents';
import { LatestCompanies } from '@/components/dashboard/overview/latest-companies';
import { companies, incidentsByCompany } from '@/data/dummy-data';
import { useRole } from '@/contexts/role-context';

export function CompaniesIncidentsView(): React.JSX.Element {
  const { role } = useRole();
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(companies[0]?.id || '');

  // For Policyholder, find the first company with incidents (or first company if none)
  const policyholderCompanyId = React.useMemo(() => {
    const companyWithIncidents = companies.find(
      company => incidentsByCompany[company.id] && incidentsByCompany[company.id].length > 0
    );
    return companyWithIncidents?.id || companies[0]?.id || '';
  }, []);

  // For Policyholder, use their company; for Insurer, use selected company
  const effectiveCompanyId = role === 'Policyholder' ? policyholderCompanyId : selectedCompanyId;

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  // For Insurer: filter out incidents without verified proof (only show 'ZK proof Verified')
  // For Policyholder: show all incidents
  const selectedIncidents = React.useMemo(() => {
    const allSelectedIncidents = incidentsByCompany[effectiveCompanyId] || [];
    if (role === 'Insurer') {
      return allSelectedIncidents.filter(incident => incident.status !== 'Need Proof');
    }
    return allSelectedIncidents;
  }, [effectiveCompanyId, role]);

  const selectedCompany = companies.find(c => c.id === effectiveCompanyId);

  const incidentsCountByCompany = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [companyId, incidents] of Object.entries(incidentsByCompany)) {
      counts[companyId] = incidents.length;
    }
    return counts;
  }, []);

  // For Policyholder: show only incidents table, full width
  if (role === 'Policyholder') {
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
          companies={companies}
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
        <LatestIncidents
          incidents={selectedIncidents}
          companyName={selectedCompany?.name}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}

