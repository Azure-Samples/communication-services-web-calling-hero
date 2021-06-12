---
page_type: sample
languages:
- javascript
- nodejs
- csharp
products:
- azure
- azure-communication-services
---

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure-Samples%2Fcommunication-services-web-calling-hero%2Fmain%2Fdeploy%2Fazuredeploy.json)

# Group Calling Sample

This is a sample application to show how the Azure Communication Services Calling Web SDK can be used to build a group calling experience.
The client-side application is a React based user interface which uses Redux for handling complex state while leveraging Microsoft Fluent UI.
Powering this front-end is a C# web application powered by ASP.NET Core to connect this application with Azure Communication Services.

A separate branch with Teams Interop capabilities is [available](https://github.com/Azure-Samples/communication-services-web-calling-hero/blob/teams-interop/README.md). Teams Interop is in public preview and uses beta SDKs that are not meant for production use. Please use the main branch sample for any production scenarios.

Additional documentation for this sample can be found on [Microsoft Docs](https://docs.microsoft.com/azure/communication-services/samples/calling-hero-sample).

![Homepage](./Media/homepage-sample-calling.png)

## Prerequisites

- Create an Azure account with an active subscription. For details, see [Create an account for free](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [Node.js (12.18.4 and above)](https://nodejs.org/en/download/)
- [Visual Studio (2019 and above)](https://visualstudio.microsoft.com/vs/)
- [.NET Core 3.1](https://dotnet.microsoft.com/download/dotnet-core/3.1) (Make sure to install version that corresponds with your visual studio instance, 32 vs 64 bit)
- Create an Azure Communication Services resource. For details, see [Create an Azure Communication Resource](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource). You'll need to record your resource **connection string** for this quickstart.
- An Azure blob storage account and container, for details, see [Create a storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal). You'll need to record your blob **connection string** and **container name** for this quickstart.
- An Azure Event grid Web hook, for details, see [Record and download calls with Event Grid](https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/voice-video-calling/download-recording-file-sample).

## Code structure

- ./Calling/ClientApp: frontend client
	- ./Calling/ClientApp/src
		- ./Calling/ClientApp/src/Components : React components to help build the client app calling experience
		- ./Calling/ClientApp/src/Containers : Connects the redux functionality to the React components
		- ./Calling/ClientApp/src/Core : Containers a redux wrapper around the Azure Communication Services Web Calling SDK
	- ./ClientApp/src/index.js : Entry point for the client app
- ./Calling/Controllers :
	- ./Calling/Controllers/UserTokenController.cs : Server app core logic for client app to get access token to use with the Azure Communication Services Web Calling SDK.
	- ./Calling/Controllers/CallRecordingController.cs : Server app core logic to start and stop a call recording session.
- ./Calling/Program.cs : Entry point for the server app program logic
- ./Calling/Startup.cs : Entry point for the server app startup logic

## Call recording management from client app

[!NOTE] This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment. To use this api please use 'beta' release of ACS Calling Web SDK

Call recording is an extended feature of the core Call API. You first need to obtain the recording feature API object:

```JavaScript
const callRecordingApi = call.api(Features.Recording);
```
Then, to can check if the call is being recorded, inspect the `isRecordingActive` property of `callRecordingApi`, it returns Boolean.

```JavaScript
const isResordingActive = callRecordingApi.isRecordingActive;
```
You can also subscribe to recording changes:

```JavaScript
const isRecordingActiveChangedHandler = () => {
  console.log(callRecordingApi.isRecordingActive);
};

callRecordingApi.on('isRecordingActiveChanged', isRecordingActiveChangedHandler);
```

Get server call id which can be used to start or stop a recording sessions:

Once the call is connected use the `getServerCallId` method to get the server call id.

```JavaScript
callAgent.on('callsUpdated', (e: { added: Call[]; removed: Call[] }): void => {
    e.added.forEach((addedCall) => {
        addedCall.on('stateChanged', (): void => {
            if (addedCall.state === 'Connected') {
                addedCall.info.getServerCallId().then(result => {
                    dispatch(setServerCallId(result));
                }).catch(err => {
                    console.log(err);
                });
            }
        });
    });
});
```

## Create a calling server client

To create a calling server client, you'll use your Communication Services connection string and pass to calling server client class.

```csharp
this.callingServerClient = new CallingServerClient("<Connection_String>");
```

## Initialize server call

To initialize `ServerCall` object, you will use `CallingServerClient` object and `serverCallId` received in response of method `getServerCallId` on client side.

```csharp
this.serverCall = this.callingServerClient.InitializeServerCall(serverCallId);
```

## Start recording session using 'StartRecordingAsync' server API

Use the `ServerCall` start recording.

```csharp
var startRecordingResponse = await this.serverCall.StartRecordingAsync(uri).ConfigureAwait(false);
```
The `StartRecordingAsync` API response contains the recording id of the recording session.

## Stop recording session using 'StopRecordingAsync' server API

Use the  recording id received in response of  `StartRecordingAsync`.

```csharp
 await this.serverCall.StopRecordingAsync(recordingId).ConfigureAwait(false);
```

## Before running the sample for the first time
1. Open an instance of PowerShell, Windows Terminal, Command Prompt or equivalent and navigate to the directory that you'd like to clone the sample to.
2. `git clone https://github.com/Azure-Samples/communication-services-web-calling-hero.git`
3. Get the `Connection String` from the Azure portal. For more information on connection strings, see [Create an Azure Communication Resources](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource)
4. Add following variables in **Calling/appsettings.json** file found under the Service .NET folder:
    - `ResourceConnectionString`: Connection string from the Azure portal.
    - `CallbackUri`: Callback uri for receiving state change callbacks.
    - `AccessKey`: Access key of the ACS communication resource.
    - `DownloadUri`: The uri to download the recording in the variable, its format should be `https://<ACS_RESOURCE_NAME>.communication.azure.com/recording/download/`.
    - `ApiVersion`: ACS SDK api version.
    - `BlobStorageConnectionString`:  Connection string of the blob storage where call recoding data is saved.
    - `ContainerName`: ContainerName of the blob storage used for saving call recording data.

## Locally deploying the sample app

1. Go to Calling folder and open `Calling.csproj` solution in Visual Studio
2. Run `Calling` project. The browser will open at localhost:5001

### Troubleshooting

1. Solution doesn\'t build, it throws errors during NPM installation/build

	Clean/rebuild the C# solution

2. The app shows an "Unsupported browser" screen but I am on a [supported browser](https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#calling-client-library-browser-support).

	If your app is being served over a hostname other then localhost, you must serve traffic over https and not http.

## Publish to Azure

1. Right click the `Calling` project and select Publish.
2. Create a new publish profile and select your app name, Azure subscription, resource group and etc.
3. Before publish, add the following keys and provide your values (copy from appsettings.json) with  `Edit App Service Settings` :
	-  `ResourceConnectionString` as connection string from Azure portal.
	-  `CallbackUri` as the key of callback uri of the application.
	-  `AccessKey` as the key of access key of ACS communication resource as value.
	-  `DownloadUri` as the key of uri to download the recording in the variable.
	-  `ApiVersion` as the key of ACS SDK api version.
	-  `BlobStorageConnectionString` as the key of connection string of the blob storage where call recoding data is saved.
	-  `ContainerName` as the key of container name of the blob storage used for saving call recording data.

**Note**: While you may use http://localhost for local testing, the sample when deployed will only work when served over https. The SDK [does not support http](https://docs.microsoft.com/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#user-webrtc-over-https).

## Building off of the sample

If you would like to build off of this sample to add calling capabilities to your own awesome application, keep a few things in mind:

- The sample serves a Single Page Application. This has a few implications.
  - By default, the served app cannot be embedded in another frame (e.g. as a web widget). See ./Calling/Startup.cs for details on how to enable embedding.
  - By default, the backend disables Cross-Origin Resource Sharing (CORS). If you'd like to serve the backend APIs from a different domain than the static content, you must enable (restricted) CORS. This can be done by configuring a middleware in the backend in ./Calling/Startup.cs, or by configuring your server framework to modify HTTP response headers.

## Additional Reading

- [Azure Communication Calling SDK](https://docs.microsoft.com/azure/communication-services/concepts/voice-video-calling/calling-sdk-features) - To learn more about the calling web sdk
- [Redux](https://redux.js.org/) - Client-side state management
- [FluentUI](https://developer.microsoft.com/en-us/fluentui#/) - Microsoft powered UI library
- [React](https://reactjs.org/) - Library for building user interfaces
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core/introduction-to-aspnet-core?view=aspnetcore-3.1) - Framework for building web applications