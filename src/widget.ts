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
    settingsSchema: [
        {
            name: "maxWidth",
            title: "Max Emote Width",
            description: "The maximum width of emotes displayed in the widget (in pixels).",
            type: "number",
            default: 128,
        },
        {
            name: "maxHeight",
            title: "Max Emote Height",
            description: "The maximum height of emotes displayed in the widget (in pixels).",
            type: "number",
            default: 64,
        },
        {
            name: "thirdPartyEmotes",
            title: "Enabled Third-Party Emote Providers",
            description: "NOTE: Any third-party emote services enabled here must also be enabled in Dashboard settings in order to show emotes from those services.",
            type: "multiselect",
            default: [],
            settings: {
                options: [
                    {
                        id: "ffz",
                        name: "FFZ"
                    },
                    {
                        id: "bttv",
                        name: "BTTV"
                    },
                    {
                        id: "7tv",
                        name: "7TV"
                    }
                ]
            }
        }
    ],
    supportsLivePreview: true,
    overlayExtension: {
        eventHandler: (event: WidgetOverlayEvent<EmoteWallWidgetConfig>, utils): void => {
            function setupLivePreviewWidget(config: typeof event.data.widgetConfig): void {
                window.emoteWallData.widgetInstances[config.id] = {
                    interval: null,
                    abortController: new AbortController(),
                    settings: config.settings
                };

                const instance = window.emoteWallData.widgetInstances[config.id];

                instance.interval = setInterval(() => {
                    const emotesToSpawn = Math.floor(Math.random() * 2) + 1;
                    const eligibleEmotes = window.emoteWallData.livePreviewEmotes.filter(e => e.platform === "twitch" || instance.settings.thirdPartyEmotes.includes(e.platform as ThirdPartyEmotePlatform));
                    for (let i = 0; i < emotesToSpawn; i++) {
                        void window.emoteWallData.renderEmotes(config, utils, eligibleEmotes[Math.floor(Math.random() * eligibleEmotes.length)].url, 1);
                    }
                }, 1000);
            }

            switch (event.name) {
                case "show": {
                    utils.initializeWidget("");
                    if (event.data.previewMode) {
                        setupLivePreviewWidget(event.data.widgetConfig);
                    } else {
                        window.emoteWallData.widgetInstances[event.data.widgetConfig.id] = {
                            interval: null,
                            abortController: new AbortController(),
                            settings: event.data.widgetConfig.settings
                        };
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
                    window.emoteWallData.widgetInstances[event.data.widgetConfig.id].settings = event.data.widgetConfig.settings;
                    utils.updateWidgetPosition();
                    break;
                }
                case "message": {
                    if (event.data.messageName !== "showEmotes" || event.data.previewMode) {
                        break;
                    }

                    const emotes: Emote[] = event.data.messageData as Emote[];
                    for (const emote of emotes) {
                        void window.emoteWallData.renderEmotes(event.data.widgetConfig, utils, emote.url, emote.amount);
                    }

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
                    { platform: "twitch", url: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_5d523adb8bbb4786821cd7091e47da21/default/dark/3.0" }, // PopNemo
                    { platform: "twitch", url: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7/default/dark/3.0" }, // DinoDance
                    { platform: "twitch", url: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_f202746ed88f4e7c872b50b1f7fd78cc/default/dark/3.0" }, // PizzaTime
                    { platform: "bttv", url: "https://cdn.betterttv.net/emote/5f2e2fcf6f378244660275ae/3x.webp" }, // dogJAM
                    { platform: "bttv", url: "https://cdn.betterttv.net/emote/5b72ac3625a3aa58e537fd55/3x.webp" }, // LULdog
                    { platform: "bttv", url: "https://cdn.betterttv.net/emote/5faee3422d853564472d5c05/3x.webp" }, // dogArrive
                    { platform: "ffz", url: "https://cdn.frankerfacez.com/emoticon/725776/animated/4" }, // catJAMPARTY
                    { platform: "ffz", url: "https://cdn.frankerfacez.com/emoticon/497794/4" }, // Catblush
                    { platform: "ffz", url: "https://cdn.frankerfacez.com/emoticon/720566/animated/4" }, // popCat
                    { platform: "7tv", url: "https://cdn.7tv.app/emote/01GKBKEJS00005SXTKNPT4H9DE/4x.avif" }, // GuntWiggle
                    { platform: "7tv", url: "https://cdn.7tv.app/emote/01HVVNFRV00004JB4FF77668BG/4x.avif" }, // blobplead
                    { platform: "7tv", url: "https://cdn.7tv.app/emote/01FZEWNFFG0003BMT7G3FYWE0F/4x.avif" }, // blobHype
                ],
                widgetInstances: {},
                renderEmotes: async (config, utils, emoteUrl, amount) => {
                    return new Promise((resolve) => {
                        const instance = window.emoteWallData.widgetInstances[config.id];
                        if (!instance) return;
                        const container = utils.getWidgetContainerElement();
                        if (!container || instance.abortController.signal.aborted) return;

                        const emoteElement = document.createElement("img");
                        emoteElement.onload = () => {
                            const aspectRatio = emoteElement.naturalWidth / emoteElement.naturalHeight;
                            if (emoteElement.naturalWidth > instance.settings.maxWidth) {
                                emoteElement.style.width = `${instance.settings.maxWidth}px`;
                                emoteElement.style.height = `${instance.settings.maxWidth / aspectRatio}px`;
                            } else if (emoteElement.naturalHeight > instance.settings.maxHeight) {
                                emoteElement.style.height = `${instance.settings.maxHeight}px`;
                                emoteElement.style.width = `${instance.settings.maxHeight * aspectRatio}px`;
                            } else {
                                emoteElement.style.width = `${emoteElement.naturalWidth}px`;
                                emoteElement.style.height = `${emoteElement.naturalHeight}px`;
                            }

                            for (let i = 0; i < amount; i++) {
                                const emote = i === 0 ? emoteElement : emoteElement.cloneNode() as HTMLImageElement;
                                emote.style.left = `${Math.random() * 100}%`;
                                emote.style.top = `${Math.random() * 100}%`;
                                container.appendChild(emote);
                                setTimeout(() => {
                                    if (instance.abortController.signal.aborted) return;
                                    emote.remove();
                                }, 5000);
                            }

                            resolve();
                        };
                        emoteElement.src = emoteUrl;
                        emoteElement.style.position = "absolute";
                        emoteElement.style.transform = "translate(-50%, -50%)";
                    });
                }
            };
        }
    }
};

export default widget;