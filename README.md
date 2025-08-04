# Recall.ai Per Participant Live Video Sample

This sample demonstrates how to interact with the Recall.ai API to receive live h264 over websocket for each individual participant

## Limitations
- The resolution is the same as what we receive from the meeting provider, and it will change over the course of the meeting
- This sample decodes everything on the main thread. For a demo with 1-2 participants this is fine, but in production you will want to check out [Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to parallelize the load

## Prerequisites
- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- **Recall.ai API Key**: You'll need an API key from your [Recall.ai Dashboard](https://us-west-2.recall.ai/dashboard/developers/api-keys).
- **Ngrok** (or a similar tunneling service): Required to expose your local WebSocket server to the internet so Recall.ai can connect to it for real-time event delivery. You can download it from [ngrok.com](https://ngrok.com/download).

## Setup Ngrok
You will need a static url for the websocket connection. We recommend setting up an [Ngrok static domain](https://docs.recall.ai/docs/local-webhook-development). We will call this static domain `my-random-domain.ngrok-free.app`

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/recallai/participant-live-video.git
cd participant-live-video
```

### 2. Install Dependencies

Navigate to the project directory and install the necessary packages:

```bash
npm install
```

### 3. Configure Environment Variables

This project uses a `.env` file to manage sensitive information and configuration.

1.  **Create a `.env` file:** In the root of the project, create a new file named `.env`.
    You can copy the `env.example` file if one is provided in the repository:

    ```bash
    cp .env.example .env
    ```

2.  **Add Your Recall.ai API Key:** Open the `.env` file and add your Recall.ai API key:

    ```env
    RECALL_API_KEY=YOUR_RECALL_API_KEY_HERE
    ```

### 4. Set up Ngrok (for Real-time Events)

To receive real-time events from the Recall.ai bot, your local server's WebSocket endpoint needs to be publicly accessible. Ngrok is a great tool for this.

**Start Ngrok:** Open a new terminal window and run ngrok to forward to your **Server Port** (default is `3456`, or the `PORT` you set in `.env`).
_Change *my-random-domain.ngrok-free.app* to your ngrok static domain!_
```bash
ngrok http --url=my-random-domain.ngrok-free.app 3456
```

_(If you configured a different `PORT`, use that number instead of 3456.)_

### 5. Run the Application

Once dependencies are installed and your `.env` file is configured, start the server:

```bash
npm run dev
```

By default, the web UI will be accessible at `http://localhost:3456` (or your configured `PORT`).
The server console will show messages indicating that the HTTP server and the Recall Bot WebSocket server are running.

## Using the Application

1.  **Open the Web UI:** Go to your static ngrok domain `my-random-domain.ngrok-free.app`

2.  **Create a Bot:**

    You will need to [create a bot](https://docs.recall.ai/reference/bot_create) configured to send h264 to your websocket
    You will need:
    - **video_mixed_layout** Must be set to `gallery_view_v2`
    - **video_separate_h264={}** Must be present in your recording config
    - **realtime_endpoints** Must include a websocket endpoint with your static domain, and must include an event for `video_separate_h264.data`. This demo expects a websocket endpoint with the path `recall-websocket`
    An example curl is:
    ```
    curl --request POST \
     --url https://us-east-1.recall.ai/api/v1/bot/ \
     --header 'Authorization: YOUR_RECALL_API_KEY' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '
    {
    "meeting_url": "https://meet.google.com/xxx-xxxx-xxx",
    "bot_name": "Demo Bot",
    "recording_config": {
        "realtime_endpoints": [
        {
            "type": "websocket",
            "url": "wss://my-random-domain.ngrok-free.app/recall-websocket",
            "events": [
            "participant_events.join",
            "participant_events.leave",
            "video_separate_h264.data"
            ]
        }
        ],
        "video_mixed_layout": "gallery_view_v2",
        "video_separate_h264": {}
    }
    }
    '
    ```
3.  **Observe:**
    Once the bot connects to the meeting, you will begin receiving video for every participant!

If anything is unclear or confusing, please feel free to open an issue! We're obsessed with building the best platform for extracting knowledge from conversational data!