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

This sample includes [**Teams Interop**](https://docs.microsoft.com/azure/communication-services/concepts/teams-interop), which allows users to join an on going Teams meeting as a guest user. This functionality is in **Public Preview**. Please use the main branch sample for any production scenarios.

Additional documentation for this sample can be found on [Microsoft Docs](https://docs.microsoft.com/azure/communication-services/samples/calling-hero-sample).

![Homepage](./Media/homepage-sample-calling.png)

## Prerequisites

- Create an Azure account with an active subscription. For details, see [Create an account for free](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)
- [Node.js (12.18.4 and above)](https://nodejs.org/en/download/)
- [Visual Studio (2019 and above)](https://visualstudio.microsoft.com/vs/)
- [.NET 5.0](https://dotnet.microsoft.com/download/dotnet/5.0) (Make sure to install version that corresponds with your visual studio instance, 32 vs 64 bit)
- Create an Azure Communication Services resource. For details, see [Create an Azure Communication Resource](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource). You'll need to record your resource **connection string** for this quickstart.
- An Azure storage account and container, for details, see [Create a storage account](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). You'll need to record your blob **connection string** and **container name** for this quickstart.
- An Azure Event grid Web hook, for details, see [Record and download calls with Event Grid](https://docs.microsoft.com/azure/communication-services/quickstarts/voice-video-calling/download-recording-file-sample).

## Code structure

- ./Calling/ClientApp: frontend client
	- ./Calling/ClientApp/src
		- ./Calling/ClientApp/src/Components : React components to help build the client app calling experience
		- ./Calling/ClientApp/src/Containers : Connects the redux functionality to the React components
		- ./Calling/ClientApp/src/Core : Containers a redux wrapper around the Azure Communication Services Web Calling SDK
	- ./ClientApp/src/index.js : Entry point for the client app
- ./Calling/Controllers:
	- ./Calling/Controllers/UserTokenController.cs : Server app core logic for client app to get a token to use with the Azure Communication Services Web Calling SDK
	- ./Calling/Controllers/CallRecordingController.cs : Server app core logic to start and stop a call recording session.
- ./Calling/Program.cs : Entry point for the server app program logic
- ./Calling/Startup.cs : Entry point for the server app startup logic

## Create a calling server client

To create a calling server client, you'll use your Azure Communication Services connection string and pass it to calling server client object.

```csharp
CallingServerClient callingServerClient = new CallingServerClient("<Resource_Connection_String>");
```

## Start recording session using 'StartRecordingAsync' server API

Use the server call id received during initiation of a call.

```csharp
var startRecordingResponse = await callingServerClient.InitializeServerCall("<servercallid>").StartRecordingAsync("<callbackuri>").ConfigureAwait(false);
```
The `StartRecordingAsync` API response contains the recording id of the recording session.

## Stop recording session using 'StopRecordingAsync' server API

Use the recording id received in response of  `StartRecordingAsync`.

```csharp
 var stopRecording = await callingServerClient.InitializeServerCall("<servercallid>").StopRecordingAsync("<recordingid>").ConfigureAwait(false);
```

## Pause recording session using 'PauseRecordingAsync' server API

Use the  recording id received in response of  `StartRecordingAsync`.

```csharp
var pauseRecording = await callingServerClient.InitializeServerCall("<servercallid>").PauseRecordingAsync("<recordingid>");
```

## Resume recording session using 'ResumeRecordingAsync' server API

Use the recording id received in response of  `StartRecordingAsync`.

```csharp
var resumeRecording = await callingServerClient.InitializeServerCall("<servercallid>").ResumeRecordingAsync("<recordingid>");
```

## Download recording File using 'DownloadStreamingAsync' server API

[!NOTE] An Azure Event grid Web hook is required to get the notification callback event when the recorded media is ready for download. For details, see [Record and download calls with Event Grid](https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/voice-video-calling/download-recording-file-sample).

When the recording is available for download, Azure Event Grid will trigger a notification callback event to the application with the following schema.

```
{
    "id": string, // Unique guid for event
    "topic": string, // Azure Communication Services resource id
    "subject": string, // /recording/call/{call-id}
    "data": {
        "recordingStorageInfo": {
            "recordingChunks": [
                {
                    "documentId": string, // Document id for retrieving from AMS storage
                    "contentLocation": string, //ACS URL where the content is located
                    "index": int, // Index providing ordering for this chunk in the entire recording
                    "endReason": string, // Reason for chunk ending: "SessionEnded", "ChunkMaximumSizeExceeded”, etc.
                }
            ]
        },
        "recordingStartTime": string, // ISO 8601 date time for the start of the recording
        "recordingDurationMs": int, // Duration of recording in milliseconds
        "sessionEndReason": string // Reason for call ending: "CallEnded", "InitiatorLeft”, etc.
    },
    "eventType": string, // "Microsoft.Communication.RecordingFileStatusUpdated"
    "dataVersion": string, // "1.0"
    "metadataVersion": string, // "1"
    "eventTime": string // ISO 8601 date time for when the event was created
}
```

Use `DownloadStreamingAsync` API for downloading the recorded media.

```csharp
var recordingDownloadUri = new Uri(downloadLocation);
var response = callingServerClient.DownloadStreamingAsync(recordingDownloadUri);
```
The downloadLocation for the recording can be fetched from the `contentLocation` attribute of the `recordingChunk`. `DownloadStreamingAsync` method returns response of type `Response<Stream>`, which contains the downloaded content.

## Before running the sample for the first time
1. Open an instance of PowerShell, Windows Terminal, Command Prompt or equivalent and navigate to the directory that you'd like to clone the sample to.
2. `git clone --branch public-preview https://github.com/Azure-Samples/communication-services-web-calling-hero.git`
3. Get the `Connection String` from the Azure portal. For more information on connection strings, see [Create an Azure Communication Resources](https://docs.microsoft.com/azure/communication-services/quickstarts/create-communication-resource)
4. Add following variables in **Calling/appsettings.json** file:
    - `ResourceConnectionString`: Connection string from the Azure Communication Service resource.
    - `CallbackUri`: Callback uri for receiving state change callbacks.
    - `RecordingBlobStorageConnectionString`:  Connection string of the storage account where call recoding data gets uploaded.
    - `RecordingContainerName`: ContainerName of the blob storage used for uploading call recording data.

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
	-  `ResourceConnectionString` as connection string from Azure Communication Service resource.
	-  `CallbackUri` as the key of callback uri of the application.
	-  `RecordingBlobStorageConnectionString` as the key of connection string of the storage account where call recoding data gets uploaded.
	-  `RecordingContainerName` as the key of container name of the blob storage used for uploading call recording data.

**Note**: While you may use http://localhost for local testing, the sample when deployed will only work when served over https. The SDK [does not support http](https://docs.microsoft.com/en-us/azure/communication-services/concepts/voice-video-calling/calling-sdk-features#user-webrtc-over-https).

## Additional Reading

- [Azure Communication Calling SDK](https://docs.microsoft.com/azure/communication-services/concepts/voice-video-calling/calling-sdk-features) - To learn more about the calling web sdk
- [Redux](https://redux.js.org/) - Client-side state management
- [FluentUI](https://developer.microsoft.com/en-us/fluentui#/) - Microsoft powered UI library
- [React](https://reactjs.org/) - Library for building user interfaces
- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core?view=aspnetcore-3.1) - Framework for building web applications
