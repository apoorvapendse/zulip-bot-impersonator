import type { Message } from "./db_types";

type Predicate = (message: Message) => boolean;

export type Filter = {
    predicate: Predicate;
};

export function stream_filter(stream_id: number): Filter {
    function predicate(message: Message): boolean {
        if (message.type === "stream") {
            return message.stream_id === stream_id;
        } else {
            return false;
        }
    }

    return { predicate };
}
