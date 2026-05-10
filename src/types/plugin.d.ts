type Params = {};

type ThirdPartyEmotePlatform = "bttv" | "ffz" | "7tv";

type EmotePlatform = "twitch" | ThirdPartyEmotePlatform;

type Emote = {
    platform: EmotePlatform;
    name: string;
    url: string;
    amount: number;
}

type EmoteWallAnimateFunction = (deltaTime: number) => Promise<void> | void;
type EmoteWallSetupAnimationFunction = (widgetId: string, emote: OverlayEmote) => OverlayEmote;

type EmoteWallAnimationData = {
    width: number;
    height: number;
    x: number;
    y: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    rotation?: number;
    function?: EmoteWallAnimateFunction;
}


type OverlayEmote = {
    image: HTMLImageElement;
    opacity: number;
    startTime?: number;
    lifespan: number;
    animationData?: EmoteWallAnimationData;
}