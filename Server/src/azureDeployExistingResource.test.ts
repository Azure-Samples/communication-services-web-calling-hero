// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import AzureDeployExistingResource from '../../deploy/azuredeployexistingresource.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getExistingResourceArmTemplate = (): any => AzureDeployExistingResource;

describe('AzureDeployExistingResource tests', () => {
  test('Arm template contains communicationServicesResourceId field', () => {
    const armTemplate = getExistingResourceArmTemplate();
    expect(armTemplate.variables).toHaveProperty('communicationServicesResourceId');
    expect(armTemplate.variables.communicationServicesResourceId).toBe(
      '<Enter your Azure Communication Services Resource Id>'
    );
  });
});
