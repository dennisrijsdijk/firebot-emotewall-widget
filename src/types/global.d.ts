interface Window {
    emoteWallData: {
        livePreviewEmotes: Array<{ platform: EmotePlatform; url: string; }>;
        widgetInstances: Record<string, { interval: ReturnType<typeof setInterval>; abortController: AbortController; }>;
    }
}