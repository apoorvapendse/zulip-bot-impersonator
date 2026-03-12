import type { MessageMap } from "./database";

type Item = {
    message_id: number;
    topic_id: number;
};

export class MessageIndex {
    items: Item[];

    constructor(message_map: MessageMap) {
        this.items = [];

        for (const message of message_map.values()) {
            const message_id = message.id;
            const topic_id = message.topic_id;
            this.items.push({ message_id, topic_id });
        }

        this.fake_large();
    }

    fake_large(): void {
        let message_id = 1000;
        const max_size = 1_000_000;
        const items = this.items;

        let i = 0;
        while (items.length < max_size) {
            message_id += 1;
            i += 1;
            const topic_id = items[i].topic_id;
            items.push({ message_id, topic_id });
        }
        console.log("SIZE", this.items.length);
    }

    add_to_index(item: Item) {
        this.items.push(item);
    }

    find_message_ids_for_topic_id(topic_id: number): Set<number> {
        const t = performance.now();

        const items = this.items;
        const message_ids = items
            .filter((item) => item.topic_id === topic_id)
            .map((item) => item.message_id);

        let elapsed;

        elapsed = performance.now() - t;
        console.log("time to find", elapsed.toFixed(6));

        const message_set = new Set(message_ids);

        elapsed = performance.now() - t;
        console.log("time with set:pizza:", elapsed.toFixed(6));

        console.log(message_set);
        return message_set;
    }
}
