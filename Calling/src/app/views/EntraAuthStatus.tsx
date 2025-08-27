// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, PrimaryButton, DefaultButton, Persona, PersonaSize } from '@fluentui/react';

export interface EntraAuthStatusProps {
  authInProgress?: boolean;
  authError?: string | null;
  authenticated?: boolean;
  userName?: string | undefined;
  onSignIn?: () => void;
  onRetry?: () => void;
  onSignOut?: () => void;
}

export const EntraAuthStatus = (props: EntraAuthStatusProps): JSX.Element => {
  const { authInProgress, authError, authenticated, userName, onSignIn, onRetry, onSignOut } = props;
  if (authInProgress) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text block variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>🔐 Signing in with Microsoft Entra ID...</Text>
        <Text block variant="small">Complete the browser sign-in prompt.</Text>
      </Stack>
    );
  }
  if (authenticated) {
    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <Persona text={userName} size={PersonaSize.size40} />
        <Text block variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>Signed in as {userName}</Text>
        <DefaultButton text="Sign out" onClick={onSignOut} />
      </Stack>
    );
  }
  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text block variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>🔐 Microsoft Entra ID Authentication</Text>
      <Text block variant="small">Sign in with your organizational account.</Text>
      {authError && <Text block variant="small" styles={{ root: { color: '#a80000' } }}>{authError}</Text>}
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text="Sign in" onClick={onSignIn} />
        {authError && <DefaultButton text="Retry" onClick={onRetry} />}
      </Stack>
    </Stack>
  );
};
