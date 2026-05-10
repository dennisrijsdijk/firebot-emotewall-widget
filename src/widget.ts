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
            name: "emoteDuration",
            title: "Emote Duration",
            description: "The duration that each emote will be displayed on the widget (in seconds).",
            type: "number",
            default: 5,
            validation: {
                min: 2
            }
        },
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
        eventHandler: async (event: WidgetOverlayEvent<EmoteWallWidgetConfig>, utils): Promise<void> => {
            function setupLivePreviewWidget(config: typeof event.data.widgetConfig): void {
                window.emoteWallData.widgetInstances[config.id] = {
                    settings: config.settings,
                    container: utils.getWidgetContainerElement(),
                    emotes: []
                };

                const instance = window.emoteWallData.widgetInstances[config.id];

                instance.previewInterval = setInterval(async () => {
                    const eligibleEmotes = window.emoteWallData.livePreviewEmotes.filter(e => e.platform === "twitch" || instance.settings.thirdPartyEmotes.includes(e.platform as ThirdPartyEmotePlatform));
                    const emotes: Array<{ url: string, amount: number }> = [];
                    for (let i = 0; i < 2; i++) {
                        emotes.push({ url: eligibleEmotes[Math.floor(Math.random() * eligibleEmotes.length)].url, amount: Math.floor(Math.random() * 3) + 1 });
                    }

                    const images = await window.emoteWallData.prepareImages(config.settings.maxWidth, config.settings.maxHeight, emotes);
                    await window.emoteWallData.addImagesToWidget(config.id, images);
                }, 2500);
            }

            switch (event.name) {
                case "show": {
                    utils.initializeWidget("");
                    if (event.data.previewMode) {
                        setupLivePreviewWidget(event.data.widgetConfig);
                    } else {
                        window.emoteWallData.widgetInstances[event.data.widgetConfig.id] = {
                            settings: event.data.widgetConfig.settings,
                            container: utils.getWidgetContainerElement(),
                            emotes: []
                        };
                    }
                    break;
                }
                case "remove": {
                    utils.removeWidget();
                    clearInterval(window.emoteWallData.widgetInstances[event.data.widgetConfig.id].previewInterval);
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
                    const images = await window.emoteWallData.prepareImages(event.data.widgetConfig.settings.maxWidth, event.data.widgetConfig.settings.maxHeight, emotes);
                    await window.emoteWallData.addImagesToWidget(event.data.widgetConfig.id, images);

                    break;
                }
                default: {
                    break;
                }
            }
        },
        onInitialLoad: (utils): void => {
            const FADE_DURATION = 0.75;
            const MIN_EMOTE_DURATION = 2;
            const DEFAULT_EMOTE_DURATION = 5;

            let renderLoopLastTime: DOMHighResTimeStamp = 0;
            let renderLoopCurrentTime: DOMHighResTimeStamp = 0;
            async function renderLoop(time: DOMHighResTimeStamp): Promise<void> {
                renderLoopCurrentTime = time;
                if (renderLoopLastTime === 0) renderLoopLastTime = renderLoopCurrentTime;
                const deltaTime = (renderLoopCurrentTime - renderLoopLastTime) / 1000;
                renderLoopLastTime = renderLoopCurrentTime;

                await Promise.all(Object.entries(window.emoteWallData.widgetInstances).map(([id, instance]) => {
                    return Promise.all(instance.emotes.map(async (emoteData) => {
                        if (performance.now() >= emoteData.endTime) {
                            emoteData.image.remove();
                            instance.emotes = instance.emotes.filter(e => e !== emoteData);
                            return;
                        } else if (performance.now() >= emoteData.fadeOutStartTime) {
                            emoteData.opacity = Math.max(emoteData.opacity - (1 / FADE_DURATION) * deltaTime, 0);
                            emoteData.image.style.opacity = emoteData.opacity.toString();
                        } else if (emoteData.opacity < 1) {
                            emoteData.opacity = Math.min(emoteData.opacity + (1 / FADE_DURATION) * deltaTime, 1);
                            emoteData.image.style.opacity = emoteData.opacity.toString();
                        }

                        // Run other animations
                    }));
                }));
                requestAnimationFrame(renderLoop);
            }

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
                prepareImages: async (maxWidth, maxHeight, emotes) => {
                    const imagePromises = emotes.map(emote => {
                        return new Promise<HTMLImageElement[]>((resolve) => {
                            const image = new Image();
                            image.style.opacity = "0";
                            image.style.position = "absolute";
                            image.style.transform = "translate(-50%, -50%)";
                            image.onload = () => {
                                if (image.naturalWidth >= image.naturalHeight) {
                                    image.style.width = `${maxWidth}px`;
                                } else {
                                    image.style.height = `${maxHeight}px`;
                                }

                                const emotes: HTMLImageElement[] = [];
                                for (let i = 0; i < emote.amount; i++) {
                                    emotes.push(i === 0 ? image : image.cloneNode() as HTMLImageElement);
                                }
                                resolve(emotes);
                            };
                            image.src = emote.url;
                        });
                    });
                    return (await Promise.all(imagePromises)).flat();
                },
                addImagesToWidget: async (widgetId, emotes) => {
                    const emoteLifespan = Math.max(window.emoteWallData.widgetInstances[widgetId].settings.emoteDuration ?? DEFAULT_EMOTE_DURATION, MIN_EMOTE_DURATION);
                    for (const emote of emotes) {
                        emote.style.left = `${Math.random() * 100}%`;
                        emote.style.top = `${Math.random() * 100}%`;
                        window.emoteWallData.widgetInstances[widgetId]?.container?.appendChild(emote);
                        window.emoteWallData.widgetInstances[widgetId]?.emotes.push({
                            image: emote,
                            opacity: 0,
                            startTime: performance.now(),
                            fadeOutStartTime: performance.now() + (emoteLifespan - FADE_DURATION) * 1000,
                            endTime: performance.now() + emoteLifespan * 1000
                        });
                    }
                }
            };

            requestAnimationFrame(renderLoop);
        }
    }
};

export default widget;