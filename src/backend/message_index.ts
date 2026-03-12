import type { MessageMap } from "./database";

type Item = {
    message_id: number;
    topic_id: number;
};

export class MessageIndex {
    ids: number[];

    constructor(message_map: MessageMap) {
        this.ids = [];

        for (const message of message_map.values()) {
            const message_id = message.id;
            const topic_id = message.topic_id;
            this.add_item({ message_id, topic_id });
        }

        this.fake_large();
    }

    add_item(item: Item): void {
        this.ids.push(item.topic_id);
        this.ids.push(item.message_id);
    }

    find_message_ids_for_topic_id(topic_id: number): number[] {
        console.log("start find");
        const t = performance.now();
        let elapsed;

        const ids = this.ids;
        const size = this.ids.length;
        const message_ids = [];

        for (let i = 0; i < size; i += 2) {
            if (ids[i] === topic_id) {
                message_ids.push(ids[i + 1]);
            }
        }

        elapsed = performance.now() - t;
        console.log("time to find", elapsed.toFixed(6));

        console.log(message_ids);
        return message_ids;
    }

    fake_large(): void {
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
