import type { RawStreamMessage } from "./model";

export const enum EventFlavor {
    STREAM_MESSAGE,
}

type StreamMessageEvent = {
    flavor: EventFlavor.STREAM_MESSAGE;
    raw_stream_message: RawStreamMessage;
    info: string;
};

export type ZulipEvent = StreamMessageEvent;

function build_event(raw_event: any): ZulipEvent | undefined {
    console.log(raw_event);

    if (raw_event.type === "message") {
        const message: any = raw_event.message;

        if (message.type === "stream") {
            const raw_stream_message: RawStreamMessage = {
                id: message.id,
                type: "stream",
                sender_id: message.sender_id,
                stream_id: message.stream_id,
                topic_name: message.subject,
                content: message.content,
            }
            return {
                flavor: EventFlavor.STREAM_MESSAGE,
                raw_stream_message,
                info: `stream message id ${message.id}`,
            };
        }

        return undefined;
    }

    return undefined;
}

type EventCallbackType = (event: ZulipEvent) => void;

export class EventHandler {
    callback: EventCallbackType;

    constructor(callback: EventCallbackType) {
        this.callback = callback;
    }

    process_events(raw_events: any): void {
        for (const raw_event of raw_events) {
            const event = build_event(raw_event);

            if (event) {
                this.callback(event);
            }
        }
    }
}
