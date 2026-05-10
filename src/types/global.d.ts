import { IOverlayWidgetEventUtils, WidgetOverlayEvent } from "@crowbartools/firebot-custom-scripts-types/types/overlay-widgets";

declare global {
    interface Window {
        emoteWallData: {
            livePreviewEmotes: Array<{ platform: EmotePlatform; url: string; }>;
            widgetInstances: Record<string, {
                interval: ReturnType<typeof setInterval>;
                settings: EmoteWallWidgetConfig;
                abortController: AbortController;
            }>;
            renderEmote: (config: WidgetOverlayEvent<EmoteWallWidgetConfig>["data"]["widgetConfig"], utils: IOverlayWidgetEventUtils, emoteUrl: string) => Promise<void>;
        };
    }
}