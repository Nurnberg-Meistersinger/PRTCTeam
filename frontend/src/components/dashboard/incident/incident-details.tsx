'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import dayjs from 'dayjs';
import { useRole } from '@/contexts/role-context';
import { useVerifyProof, useGenerateProof } from '@/lib/api';

export interface IncidentDetailsData {
  id: string;
  incident_id: string;
  companyId?: string;
  commitment: string;
  txHash?: string;
  status: 'Need Proof' | 'Proof Not Verified' | 'ZK proof Verified';
  proof?: {
    hash: string;
    size: number;
    jsonUrl: string;
    publicInputs?: string[];
    txHash?: string;
    blockchainStatus?: 'Pending' | 'Confirmed' | 'Failed';
  };
  createdAt: Date;
}

interface IncidentDetailsProps {
  incident: IncidentDetailsData;
  companyName?: string;
  onIncidentUpdate?: () => void;
}

const statusMap = {
  'Need Proof': { label: 'Need Proof', color: 'error' },
  'Proof Not Verified': { label: 'Proof Not Verified', color: 'warning' },
  'ZK proof Verified': { label: 'ZK proof Verified', color: 'success' },
} as const;

// Network can be configured later
function getEtherscanUrl(txHash: string): string {
  return `https://devnet.aztecscan.xyz/tx-effects/${txHash}`;
}

export function IncidentDetails({ incident, companyName, onIncidentUpdate }: IncidentDetailsProps): React.JSX.Element {
  const { role } = useRole();
  const [copiedCommitment, setCopiedCommitment] = React.useState(false);
  const [copiedTxHash, setCopiedTxHash] = React.useState(false);
  const [copiedProofHash, setCopiedProofHash] = React.useState(false);
  const [copiedPublicInput, setCopiedPublicInput] = React.useState<Record<number, boolean>>({});
  const [currentIncident, setCurrentIncident] = React.useState<IncidentDetailsData>(incident);

  // Use verify proof mutation from API
  const verifyProofMutation = useVerifyProof({
    onSuccess: async () => {
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Trigger refetch in parent component
      if (onIncidentUpdate) {
        onIncidentUpdate();
      }
    },
    onError: (error) => {
      console.error('Failed to verify proof:', error);
      // Could show error toast here if needed
    },
  });

  // Use generate proof mutation from API
  const generateProofMutation = useGenerateProof({
    onSuccess: async () => {
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Trigger refetch in parent component
      if (onIncidentUpdate) {
        onIncidentUpdate();
      }
    },
    onError: (error) => {
      console.error('Failed to generate proof:', error);
      // Could show error toast here if needed
    },
  });

  const handleCopy = async (text: string, type: 'commitment' | 'txHash' | 'proofHash' | 'publicInput', index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      switch (type) {
        case 'commitment': {
          setCopiedCommitment(true);
          setTimeout(() => setCopiedCommitment(false), 2000);
          break;
        }
        case 'txHash': {
          setCopiedTxHash(true);
          setTimeout(() => setCopiedTxHash(false), 2000);
          break;
        }
        case 'proofHash': {
          setCopiedProofHash(true);
          setTimeout(() => setCopiedProofHash(false), 2000);
          break;
        }
        case 'publicInput': {
          if (index !== undefined) {
            setCopiedPublicInput(prev => ({ ...prev, [index]: true }));
            setTimeout(() => setCopiedPublicInput(prev => ({ ...prev, [index]: false })), 2000);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const blockchainStatusMap = {
    'Pending': { label: 'Pending', color: 'warning' },
    'Confirmed': { label: 'Confirmed', color: 'success' },
    'Failed': { label: 'Failed', color: 'error' },
  } as const;

  // Handle proof generation
  const handleGenerateProof = React.useCallback(async () => {
    try {
      await generateProofMutation.mutateAsync(currentIncident.incident_id);
      // Data will be automatically refetched by React Query after invalidation
      // The incident prop will be updated with new data from API
    } catch (error) {
      // Error is already handled in mutation's onError callback
      console.error('Proof generation failed:', error);
    }
  }, [currentIncident.incident_id, generateProofMutation]);

  // Handle incident verification (only for Insurer)
  const handleVerifyIncident = React.useCallback(async () => {
    if (!currentIncident.companyId) {
      console.error('Company ID is required for verification');
      return;
    }

    try {
      await verifyProofMutation.mutateAsync({
        companyId: currentIncident.companyId,
        incidentId: currentIncident.incident_id,
      });
      // Data will be automatically refetched by React Query
    } catch (error) {
      // Error is already handled in mutation's onError callback
      console.error('Verification failed:', error);
    }
  }, [currentIncident.companyId, currentIncident.incident_id, verifyProofMutation]);

  const commitmentPreview = `${currentIncident.commitment.slice(0, 10)}...`;
  const { label, color } = statusMap[currentIncident.status] ?? { label: 'Unknown', color: 'default' };
  const hasProof = !!currentIncident.proof;
  const needsProof = currentIncident.status === 'Need Proof';
  const proofNotVerified = currentIncident.status === 'Proof Not Verified';
  const showVerifyButton = role === 'Insurer' && proofNotVerified && hasProof;
  const isVerifyingIncident = verifyProofMutation.isPending;
  const isGeneratingProof = generateProofMutation.isPending;

  // Update local incident state when prop changes
  React.useEffect(() => {
    setCurrentIncident(incident);
  }, [incident]);

  // For Policyholder, don't show company name in title
  const title = role === 'Policyholder' || !companyName
    ? `Incident #${currentIncident.incident_id}`
    : `Incident #${currentIncident.incident_id} - ${companyName}`;

  return (
    <Card>
        <CardHeader 
          title={title}
          action={
            <Chip color={color} label={label} size="small" />
          }
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            {/* Incident ID */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Incident ID
              </Typography>
              <Typography variant="body1">{currentIncident.incident_id}</Typography>
            </Box>

            <Divider />

            {/* Commitment */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Commitment
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {commitmentPreview}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(currentIncident.commitment, 'commitment')}
                  sx={{ ml: 1 }}
                >
                  {copiedCommitment ? (
                    <Check fontSize="var(--icon-fontSize-md)" />
                  ) : (
                    <Copy fontSize="var(--icon-fontSize-md)" />
                  )}
                </IconButton>
              </Stack>
            </Box>

            <Divider />

            {/* Transaction Hash */}
            {currentIncident.txHash && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Transaction Hash
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {currentIncident.txHash}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(currentIncident.txHash!, 'txHash')}
                      sx={{ ml: 1 }}
                    >
                      {copiedTxHash ? (
                        <Check fontSize="var(--icon-fontSize-md)" />
                      ) : (
                        <Copy fontSize="var(--icon-fontSize-md)" />
                      )}
                    </IconButton>
                  </Stack>
                </Box>
                <Divider />
              </>
            )}

            {/* Proof Section - визуально отделена */}
            <Card 
              variant="outlined" 
              sx={{ 
                backgroundColor: 'action.hover',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                {needsProof ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ZK Proof
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleGenerateProof}
                      disabled={isGeneratingProof}
                      sx={{ mt: 2 }}
                      startIcon={isGeneratingProof ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                      {isGeneratingProof ? 'Generating...' : 'Generate proof'}
                    </Button>
                  </Box>
                ) : (hasProof ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ZK Proof Summary
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                      {/* Proof Hash */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Proof Hash
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                            {currentIncident.proof!.hash}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(currentIncident.proof!.hash, 'proofHash')}
                          >
                            {copiedProofHash ? (
                              <Check fontSize="var(--icon-fontSize-md)" />
                            ) : (
                              <Copy fontSize="var(--icon-fontSize-md)" />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Public Inputs */}
                      {currentIncident.proof!.publicInputs && currentIncident.proof!.publicInputs.length > 0 && (
                        <>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Public Inputs
                            </Typography>
                            <Stack spacing={1}>
                              {currentIncident.proof!.publicInputs.map((input, index) => (
                                <Stack key={index} direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1, wordBreak: 'break-all' }}>
                                    {input}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopy(input, 'publicInput', index)}
                                  >
                                    {copiedPublicInput[index] ? (
                                      <Check fontSize="var(--icon-fontSize-md)" />
                                    ) : (
                                      <Copy fontSize="var(--icon-fontSize-md)" />
                                    )}
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {/* Commitment */}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Commitment
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                            {currentIncident.commitment}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(currentIncident.commitment, 'commitment')}
                          >
                            {copiedCommitment ? (
                              <Check fontSize="var(--icon-fontSize-md)" />
                            ) : (
                              <Copy fontSize="var(--icon-fontSize-md)" />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Transaction Hash (Blockchain) */}
                      {currentIncident.proof!.txHash && (
                        <>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Transaction Hash
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Link 
                                href={getEtherscanUrl(currentIncident.proof!.txHash)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}
                              >
                                {currentIncident.proof!.txHash}
                              </Link>
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(currentIncident.proof!.txHash!, 'txHash')}
                              >
                                {copiedTxHash ? (
                                  <Check fontSize="var(--icon-fontSize-md)" />
                                ) : (
                                  <Copy fontSize="var(--icon-fontSize-md)" />
                                )}
                              </IconButton>
                            </Stack>
                          </Box>
                          <Divider />
                        </>
                      )}

                      {/* Blockchain Status */}
                      {currentIncident.proof!.blockchainStatus && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Blockchain Status
                          </Typography>
                          <Chip 
                            color={blockchainStatusMap[currentIncident.proof!.blockchainStatus].color as 'warning' | 'success' | 'error'} 
                            label={blockchainStatusMap[currentIncident.proof!.blockchainStatus].label} 
                            size="small" 
                          />
                        </Box>
                      )}
                    </Stack>
                    {/* Verify Incident button - only for Insurer when status is Proof Not Verified */}
                    {showVerifyButton && (
                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleVerifyIncident}
                          disabled={isVerifyingIncident}
                          startIcon={isVerifyingIncident ? <CircularProgress size={16} color="inherit" /> : undefined}
                        >
                          {isVerifyingIncident ? 'Verifying...' : 'Verify Incident'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : null)}
              </CardContent>
            </Card>

            <Divider />

            {/* Created At */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created At
              </Typography>
              <Typography variant="body2">
                {dayjs(currentIncident.createdAt).format('MMM D, YYYY [at] h:mm A')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
  );
}

