import { add_stream_messages_to_cache, RawStreamMessage } from "./model";
import { event_radio_widget } from "./steve";

const enum EventFlavor {
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

export function process_events(raw_events: any, callback: () => void) {
    for (const raw_event of raw_events) {
        const event = build_event(raw_event);

        if (event) {
            event_radio_widget.add_event(event);

            if (event.flavor === EventFlavor.STREAM_MESSAGE) {
                add_stream_messages_to_cache(event.raw_stream_message);
            }

            callback();
        }
    }
}
