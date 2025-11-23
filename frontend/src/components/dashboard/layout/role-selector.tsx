'use client';

import React from 'react';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';
import { useRole, type UserRole } from '@/contexts/role-context';
import { useAztec } from '@/contexts/aztec-provider';

const roles: { value: UserRole; label: string }[] = [
  { value: 'Policyholder', label: 'Policyholder' },
  { value: 'Insurer', label: 'Insurer' },
];

export interface RoleSelectorProps {
  sx?: SxProps;
}

export function RoleSelector({ sx }: RoleSelectorProps): React.JSX.Element | null {
  const { role, setRole } = useRole();
  const { isConnected } = useAztec();

  const handleChange = (event: SelectChangeEvent<UserRole>) => {
    setRole(event.target.value as UserRole);
  };

  // Don't render if wallet is not connected
  if (!isConnected) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={sx}>
      <Typography variant="body2" color="text.secondary">
        Role:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={role}
          onChange={handleChange}
          displayEmpty
          sx={{
            height: '36px',
            fontSize: '0.875rem',
          }}
        >
          {roles.map((roleOption) => (
            <MenuItem key={roleOption.value} value={roleOption.value}>
              {roleOption.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

