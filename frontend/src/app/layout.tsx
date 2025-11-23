import * as React from 'react';
import { ReactNode } from "react";
import type { Viewport } from 'next';

import '@/styles/global.css';

import { AztecProvider } from "@/contexts/aztec-provider";
import { RoleProvider } from "@/contexts/role-context";

import { LocalizationProvider } from '@/components/core/localization-provider';
import { QueryProvider } from '@/components/core/query-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
          <LocalizationProvider>
            <QueryProvider>
              <AztecProvider>
                <RoleProvider>
                  <ThemeProvider>{children}</ThemeProvider>
                </RoleProvider>
              </AztecProvider>
            </QueryProvider>
          </LocalizationProvider>
      </body>
    </html>
  );
}
