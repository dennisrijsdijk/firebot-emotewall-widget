import { OverlayWidgetType, WidgetOverlayEvent } from "@crowbartools/firebot-custom-scripts-types/types/overlay-widgets";

const widget: OverlayWidgetType<EmoteWallWidgetConfig> = {
    id: "dennisontheinternet:emote-wall",
    name: "Emote Wall",
    description: "A widget which automatically displays emotes used in chat messages",
    icon: "fas fa-grin-alt",
    userCanConfigure: {
        entryAnimation: false,
        exitAnimation: false,
    },
    settingsSchema: [],
    supportsLivePreview: true,
    overlayExtension: {
        eventHandler: (event: WidgetOverlayEvent<EmoteWallWidgetConfig>, utils): void => {
            function generateWidgetHtml(config: typeof event.data.widgetConfig): string {
                return `<div id="emote-wall-${config.id}-container" style="position: relative; overflow: hidden; width: ${config.position.width}px; height: ${config.position.height}px; z-index: ${config.zIndex ?? 0};"></div>`;
            }

            function setupLivePreviewWidget(config: typeof event.data.widgetConfig): void {
                window.emoteWallData.widgetInstances[config.id] = {
                    interval: null,
                    abortController: new AbortController()
                };

                const instance = window.emoteWallData.widgetInstances[config.id];

                instance.interval = setInterval(() => {
                    const container = document.getElementById(`emote-wall-${config.id}-container`);
                    if (!container|| instance.abortController.signal.aborted || container.children.length > 20) return;
                    const emoteUrl = window.emoteWallData.livePreviewEmotes[Math.floor(Math.random() * window.emoteWallData.livePreviewEmotes.length)].url;
                    const emoteElement = document.createElement("img");
                    emoteElement.src = emoteUrl;
                    emoteElement.style.position = "absolute";
                    emoteElement.style.left = `${Math.random() * 100}%`;
                    emoteElement.style.top = `${Math.random() * 100}%`;
                    emoteElement.style.transform = "translate(-50%, -50%)";
                    emoteElement.style.maxWidth = "50px";
                    emoteElement.style.maxHeight = "50px";
                    container.appendChild(emoteElement);
                    setTimeout(() => {
                        if (instance.abortController.signal.aborted) return;
                        emoteElement.remove();
                    }, 2000);
                }, 1000);
            }

            switch (event.name) {
                case "show": {
                    utils.initializeWidget(generateWidgetHtml(event.data.widgetConfig));
                    if (event.data.previewMode) {
                        setupLivePreviewWidget(event.data.widgetConfig);
                    }
                    break;
                }
                case "remove": {
                    utils.removeWidget();
                    window.emoteWallData.widgetInstances[event.data.widgetConfig.id]?.abortController.abort();
                    clearInterval(window.emoteWallData.widgetInstances[event.data.widgetConfig.id].interval);
                    delete window.emoteWallData.widgetInstances[event.data.widgetConfig.id];
                    break;
                }
                case "settings-update": {
                    window.emoteWallData.widgetInstances[event.data.widgetConfig.id]?.abortController.abort();
                    clearInterval(window.emoteWallData.widgetInstances[event.data.widgetConfig.id].interval);
                    delete window.emoteWallData.widgetInstances[event.data.widgetConfig.id];
                    utils.updateWidgetContent(generateWidgetHtml(event.data.widgetConfig));
                    utils.updateWidgetPosition();
                    if (event.data.previewMode) {
                        setupLivePreviewWidget(event.data.widgetConfig);
                    }
                    break;
                }
                case "message": {
                    // TODO: Handle chat message event
                    break;
                }
                default: {
                    break;
                }
            }
        },
        onInitialLoad: (utils): void => {
            window.emoteWallData = {
                livePreviewEmotes: [
                    { platform: "twitch", url: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_5d523adb8bbb4786821cd7091e47da21/default/dark/3.0" },
                    { platform: "bttv", url: "https://cdn.betterttv.net/emote/5faee3422d853564472d5c05/3x.webp" },
                    { platform: "ffz", url: "https://cdn.frankerfacez.com/emoticon/720566/animated/4" },
                    { platform: "7tv", url: "https://cdn.7tv.app/emote/01GKBKEJS00005SXTKNPT4H9DE/4x.avif" },
                ],
                widgetInstances: {}
            };
        }
    }
};

export default widget;