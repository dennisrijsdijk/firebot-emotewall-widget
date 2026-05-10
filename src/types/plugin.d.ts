type Params = { };

type ThirdPartyEmotePlatform = "bttv" | "ffz" | "7tv";

type EmotePlatform = "twitch" | ThirdPartyEmotePlatform;

type Emote = {
    platform: EmotePlatform;
    name: string;
    url: string;
    amount: number;
}