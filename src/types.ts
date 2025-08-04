import { Request, Response, NextFunction } from "express";
// WebSocket type is not directly used in these type definitions after all.

// HTTP Request Handler Type
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export type AudioDataEvent = {
  event: "audio_mixed_raw.data";
  data: {
    data: {
      buffer: string;
      timestamp: { relative: number; absolute: string };
    };
    realtime_endpoint: { id: string; metadata: Record<string, string> };
    recording: { id: string; metadata: Record<string, string> };
    bot: { id: string; metadata: Record<string, string> };
    audio_mixed_raw: { id: string; metadata: Record<string, string> };
  };
};

export type VideoSeparateH264DataEvent = {
  event: "video_separate_h264.data";
  data: {
    data: {
      buffer: string; // base64 encoded h264
      timestamp: { relative: number; absolute: string };
      type: "webcam" | "screenshare";
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: object;
      };
    };
    realtime_endpoint: { id: string; metadata: object };
    video_separate: { id: string; metadata: object };
    recording: { id: string; metadata: object };
    bot: { id: string; metadata: object };
  };
};
export type VideoSeparatePngDataEvent = {
  event: "video_separate_png.data";
  data: {
    data: {
      buffer: string; // base64 encoded png
      timestamp: { relative: number; absolute: string };
      type: "webcam" | "screenshare";
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: object;
      };
    };
    realtime_endpoint: { id: string; metadata: object };
    video_separate: { id: string; metadata: object };
    recording: { id: string; metadata: object };
    bot: { id: string; metadata: object };
  };
};

export type AudioSeparateRawDataEvent = {
  event: "audio_separate_raw.data";
  data: {
    data: {
      buffer: string; // base64 encoded pcm raw audio
      timestamp: { relative: number; absolute: string };
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: object;
      };
    };
    realtime_endpoint: { id: string; metadata: object };
    audio_separate: { id: string; metadata: object };
    recording: { id: string; metadata: object };
    bot: { id: string; metadata: object };
  };
};

// Transcript event types (assuming simple structure for now, can be expanded)
export type TranscriptDataEvent = {
  event: "transcript.data" | "transcript.partial_data";
  data: any; // Define more specifically if schema is known
};

export type ParticipantJoinEvent = {
  event: "participant_event.join";
  data: {
    data: {
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: object;
      };
      timestamp: { relative: number; absolute: string };
    };
    realtime_endpoint: { id: string; metadata: object };
    participant_events: { id: string; metadata: object };
    recording: { id: string; metadata: object };
    bot: { id: string; metadata: object };
  };
};
export type ParticipantLeaveEvent = {
  event: "participant_event.leave";
  data: {
    data: {
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: object;
      };
      timestamp: { relative: number; absolute: string };
    };
    realtime_endpoint: { id: string; metadata: object };
    participant_events: { id: string; metadata: object };
    recording: { id: string; metadata: object };
    bot: { id: string; metadata: object };
  };
};

// Union type for WebSocket messages from Recall Bot
export type RecallBotWebSocketMessage =
  | AudioDataEvent
  | VideoSeparatePngDataEvent
  | VideoSeparateH264DataEvent
  | ParticipantJoinEvent
  | ParticipantLeaveEvent
  | AudioSeparateRawDataEvent
  | TranscriptDataEvent // Added TranscriptDataEvent
  | { event: string; data: any }; // Fallback for other/unknown events
