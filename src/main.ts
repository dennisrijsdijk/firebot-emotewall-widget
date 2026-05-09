import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Emote Wall Widget",
      description: "An overlay widget which shows emotes used in chat.",
      author: "DennisOnTheInternet",
      version: "0.0.1",
      firebotVersion: "5",
      website: "https://github.com/dennisrijsdijk/firebot-emotewall-widget",
      startupOnly: true
    };
  },
  getDefaultParameters: () => ({ }),
  run: (runRequest) => { },
};

export default script;
