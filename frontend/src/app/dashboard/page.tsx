import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';

import { config } from '@/config';
import { LatestIncidents } from '@/components/dashboard/overview/latest-incidents';
import { LatestCompanies } from '@/components/dashboard/overview/latest-companies';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
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
          products={[
            {
              id: 'COMP-001',
              name: 'TechFlow Solutions',
              image: '/assets/logo-slack.png',
              updatedAt: dayjs().subtract(12, 'minutes').toDate(),
            },
            {
              id: 'COMP-002',
              name: 'CloudSync Systems',
              image: '/assets/logo-dropbox.png',
              updatedAt: dayjs().subtract(25, 'minutes').subtract(1, 'hour').toDate(),
            },
            {
              id: 'COMP-003',
              name: 'CodeForge Technologies',
              image: '/assets/logo-github.png',
              updatedAt: dayjs().subtract(8, 'minutes').subtract(2, 'hour').toDate(),
            },
            {
              id: 'COMP-004',
              name: 'RideShare Pro',
              image: '/assets/logo-lyft.png',
              updatedAt: dayjs().subtract(35, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'COMP-005',
              name: 'ContentHub Media',
              image: '/assets/logo-medium.png',
              updatedAt: dayjs().subtract(18, 'minutes').subtract(4, 'hour').toDate(),
            },
            {
              id: 'COMP-006',
              name: 'WebSpace Creations',
              image: '/assets/logo-squarespace.png',
              updatedAt: dayjs().subtract(45, 'minutes').subtract(5, 'hour').toDate(),
            },
          ]}
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
          incidents={[
            {
              id: 'INC-001',
              incident_id: '1',
              status: 'ZK proof Verified',
              createdAt: dayjs().subtract(15, 'minutes').toDate(),
            },
            {
              id: 'INC-002',
              incident_id: '2',
              status: 'Not Verified',
              createdAt: dayjs().subtract(32, 'minutes').toDate(),
            },
            {
              id: 'INC-003',
              incident_id: '3',
              status: 'ZK proof Verified',
              createdAt: dayjs().subtract(48, 'minutes').toDate(),
            },
            {
              id: 'INC-004',
              incident_id: '4',
              status: 'Not Verified',
              createdAt: dayjs().subtract(1, 'hour').subtract(12, 'minutes').toDate(),
            },
            {
              id: 'INC-005',
              incident_id: '5',
              status: 'ZK proof Verified',
              createdAt: dayjs().subtract(2, 'hours').toDate(),
            },
            {
              id: 'INC-006',
              incident_id: '6',
              status: 'Not Verified',
              createdAt: dayjs().subtract(3, 'hours').subtract(25, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
