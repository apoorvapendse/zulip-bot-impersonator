import type { Message } from "./db_types";

type Item = {
    topic_id: number;
    message_id: number;
};

export class MessageIndex {
    // we store topic_id and message_id in consecutive
    // indexes (so 2 slots per message)
    ids: number[];

    constructor() {
        this.ids = [];
    }

    add_item(item: Item): void {
        this.ids.push(item.topic_id);
        this.ids.push(item.message_id);
    }

    add_message(message: Message): void {
        this.ids.push(message.topic_id);
        this.ids.push(message.id);
    }

    candidate_message_ids_for_topic_id(topic_id: number): Set<number> {
        const ids = this.ids;
        const size = this.ids.length;
        const message_ids = [];

        for (let i = 0; i < size; i += 2) {
            if (ids[i] === topic_id) {
                message_ids.push(ids[i + 1]);
            }
        }

        return new Set(message_ids);
    }

    fake_large(): void {
        // for testing
        let message_id = 1000;
        const max_size = 1_000_000;
        const ids = this.ids;

        let i = 0;
        while (ids.length < max_size * 2) {
            message_id += 1;
            const topic_id = ids[i];
            this.add_item({ message_id, topic_id });
            i += 2;
        }
        console.log("SIZE", this.ids.length);
    }
}
