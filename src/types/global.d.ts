import { IOverlayWidgetEventUtils, WidgetOverlayEvent } from "@crowbartools/firebot-custom-scripts-types/types/overlay-widgets";

declare global {
    interface Window {
        emoteWallData: {
            livePreviewEmotes: Array<{ platform: EmotePlatform; url: string; }>;
            widgetInstances: Record<string, {
                previewInterval?: ReturnType<typeof setInterval> | null;
                settings: EmoteWallWidgetConfig;
                container: HTMLElement | null;
                emotes: Array<{
                    image: HTMLImageElement;
                    opacity: number;
                    startTime: number;
                    fadeOutStartTime: number;
                    endTime: number;
                }>
            }>;
            prepareImages: (maxWidth: number, maxHeight: number, emotes: Array<{ url: string; amount: number }>) => Promise<HTMLImageElement[]>;
            addImagesToWidget: (widgetId: string, images: HTMLImageElement[]) => Promise<void>;
        };
    }
}