---
page_type: sample
languages:
- javascript
- nodejs
products:
- azure
- azure-communication-services
---

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure-Samples%2Fcommunication-services-web-calling-hero%2Fmain%2Fdeploy%2Fazuredeploy.json)

# Group Calling Sample

This is a sample application to show how the Azure Communication Services Calling Web SDK can be used to build a group calling experience.
The client-side application is a React based user interface which uses Redux for handling complex state while leveraging Microsoft Fluent UI.

A separate branch with features currently in public preview is [available](https://github.com/Azure-Samples/communication-services-web-calling-hero/tree/public-preview). Features include: Teams Interop which in public preview and uses beta SDKs that are not meant for production use. Please use the main branch sample for any production scenarios.

Additional documentation for this sample can be found on [Microsoft Docs](https://docs.microsoft.com/azure/communication-services/samples/calling-hero-sample).

Before contributing to this sample, please read our [contribution guidelines](./CONTRIBUTING.md).

![Homepage](./Media/homepage-sample-calling.png)

## Prerequisites

- Create an Azure account with an active subscription. For details, see [Create an account for free](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [Node.js (12.18.4 and above)](https://nodejs.org/en/download/)
- Create an Azure Communication Services resource. For details, see [Create an Azure Communication Resource](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource). You'll need to record your resource **connection string** for this quickstart.

## Before running the sample for the first time
1. Open an instance of PowerShell, Windows Terminal, Command Prompt or equivalent and navigate to the directory that you'd like to clone the sample to.
2. `git clone https://github.com/Azure-Samples/communication-services-web-calling-hero.git`
3. Get the `Connection String` from the Azure portal. For more information on connection strings, see [Create an Azure Communication Resources](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource)
4. Once you get the `Connection String`, add the connection string to the **Server/appsetting.json** file found under the Calling folder. Input your connection string in the variable: `ResourceConnectionString`.

## Locally deploying the sample app

1. "npm run start" from the root directory
2. Open at localhost:3000 in your browser when compilation is complete

### Troubleshooting

1. The app shows an "Unsupported browser" screen but I am on a [supported browser](https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#calling-client-library-browser-support).

	If your app is being served over a hostname other then localhost, you must serve traffic over https and not http.

## Publish to Azure

1. Run "npm run build" from the root directory. Deploy the "build" folder in the Calling directory to your Azure App Service.

**Note**: While you may use http://localhost for local testing, the sample when deployed will only work when served over https. The SDK [does not support http](https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#user-webrtc-over-https).

## Additional Reading

- [Azure Communication Calling SDK](https://docs.microsoft.com/azure/communication-services/concepts/voice-video-calling/calling-sdk-features) - To learn more about the calling web sdk
- [FluentUI](https://developer.microsoft.com/en-us/fluentui#/) - Microsoft powered UI library
- [React](https://reactjs.org/) - Library for building user interfaces
- [Storybook](aka.ms/acsstorybook/) - Component Library documentation
