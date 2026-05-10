interface Window {
    emoteWallData: {
        livePreviewEmotes: Array<{ platform: EmotePlatform; url: string; }>;
        widgetInstances: Record<string, {
            previewInterval?: ReturnType<typeof setInterval> | null;
            settings: EmoteWallWidgetConfig;
            container: HTMLElement | null;
            emotes: Array<OverlayEmote>;
        }>;
        prepareImages: (maxWidth: number, maxHeight: number, emotes: Array<{ url: string; amount: number }>) => Promise<HTMLImageElement[]>;
        addImagesToWidget: (widgetId: string, images: HTMLImageElement[]) => Promise<void>;
        arrayShuffle: <T>(array: T[]) => T[];
    };
}