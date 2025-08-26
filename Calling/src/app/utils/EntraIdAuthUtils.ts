// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { InteractiveBrowserCredential } from '@azure/identity';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

export interface EntraIdAuthResult {
  credential: AzureCommunicationTokenCredential;
  userInfo: { displayName: string; email: string; userId: string };
}
export interface EntraIdConfig { clientId: string; tenantId: string; resourceEndpoint: string; redirectUri?: string; }

export const authenticateWithEntraId = async (config: EntraIdConfig): Promise<EntraIdAuthResult> => {
  const entraTokenCredential = new InteractiveBrowserCredential({
    clientId: config.clientId,
    tenantId: config.tenantId,
    authorityHost: 'https://login.microsoftonline.com/organizations',
    redirectUri: config.redirectUri
  });
  const acsCredential = new AzureCommunicationTokenCredential({
    resourceEndpoint: config.resourceEndpoint,
    tokenCredential: entraTokenCredential,
    scopes: ['https://communication.azure.com/clients/VoIP']
  });
  const userInfo = await getEntraIdUserInfo(entraTokenCredential);
  return { credential: acsCredential, userInfo };
};

export const getEntraIdUserInfo = async (
  credential: InteractiveBrowserCredential
): Promise<{ displayName: string; email: string; userId: string }> => {
  try {
    const tokenResponse = await credential.getToken(['https://graph.microsoft.com/.default']);
    if (!tokenResponse?.token) throw new Error('No token');
    const parts = tokenResponse.token.split('.');
    if (parts.length !== 3) throw new Error('Bad token');
    const payload = JSON.parse(atob(parts[1]));
    return {
      displayName: payload.name || payload.preferred_username || payload.upn || 'Entra ID User',
      email: payload.upn || payload.preferred_username || payload.email || '',
      userId: payload.oid || payload.sub || ''
    };
  } catch {
    return { displayName: 'Entra ID User', email: '', userId: '' };
  }
};

export const getEntraIdConfig = (): EntraIdConfig => {
  const clientId = process.env.REACT_APP_ENTRA_CLIENT_ID;
  const tenantId = process.env.REACT_APP_ENTRA_TENANT_ID || 'organizations';
  const resourceEndpoint = process.env.REACT_APP_ACS_RESOURCE_ENDPOINT;
  const origin = (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost';
  const redirectUri = process.env.REACT_APP_ENTRA_REDIRECT_URI || `${origin}/entra-auth-callback`;
  if (!clientId || !resourceEndpoint) {
    throw new Error('Missing required Entra ID configuration');
  }
  return { clientId, tenantId, resourceEndpoint, redirectUri };
};

export const signOutEntraId = (config?: EntraIdConfig): void => {
  const tenant = config?.tenantId || 'organizations';
  const postLogout = config?.redirectUri || (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost';
  const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
  try { window.open(url, '_blank', 'noopener,noreferrer'); } catch { /* ignore */ }
};
