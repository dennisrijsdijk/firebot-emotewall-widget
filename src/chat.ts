import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { EventManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import { OverlayWidgetConfig } from "@crowbartools/firebot-custom-scripts-types/types/overlay-widgets";
import { EventEmitter } from "node:events";

export default function setupChatListener(modules: ScriptModules): void {
    (modules.eventManager as EventManager & EventEmitter).on("event-triggered", (event: EventManagerEvent) => {
        if (event.source.id !== "twitch" || event.event.id !== "chat-message") {
            return;
        }

        const chatMessageMetadata = event.meta as unknown as ChatEventMetadata;

        const emotes: Record<string, Emote> = {};

        for (const part of chatMessageMetadata.chatMessage.parts as FirebotChatMessageEmotePart[]) {
            if (part.type === "emote" || part.type === "third-party-emote") {
                emotes[part.name] ??= {
                    platform: part.origin.toLowerCase() as EmotePlatform,
                    name: part.name,
                    url: part.animatedUrl ?? part.url,
                    amount: 0
                };

                emotes[part.name].amount++;
            }
        }

        const widgetConfigs = modules.overlayWidgetConfigManager.getConfigsOfType<OverlayWidgetConfig<EmoteWallWidgetConfig>>("dennisontheinternet:emote-wall");

        for (const widgetConfig of widgetConfigs) {
            const eligibleEmotes = Object.values(emotes).filter(e => e.platform === "twitch" || widgetConfig.settings.thirdPartyEmotes.includes(e.platform as ThirdPartyEmotePlatform));
            modules.overlayWidgetsManager.sendWidgetEventToOverlay("message", widgetConfig, { messageName: "showEmotes", messageData: eligibleEmotes });
        }
    });
}