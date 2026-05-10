type EventDefinition = {
    id: string;
    name: string;
    description: string;
    cached?: boolean;
    cacheMetaKey?: string;
    cacheTtlInSecs?: number;
    manualMetadata?: Record<string, unknown>;
    activityFeed?: {
        icon: string;
        getMessage: (eventData: Record<string, any>) => string;
        excludeFromChatFeed?: boolean;
    };
};

type EventSourceDefinition = {
    id: string;
    name: string;
    description?: string;
    events: EventDefinition[];
};

type EventManagerEvent = {
    event: EventDefinition;
    source: EventSourceDefinition;
    meta: Record<string, unknown>;
    isManual: boolean;
    isRetrigger: boolean;
};