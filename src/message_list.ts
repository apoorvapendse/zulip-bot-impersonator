import type { RawMessage, Topic } from "./model";

import { MessageRow } from "./message_row";
import * as model from "./model";
import { SmartList } from "./smart_list";

type MessageInfo = {
    message: RawMessage;
    sender_id: number | undefined;
};

export class MessageList {
    div: HTMLElement;
    topic: Topic;

    constructor(topic: Topic) {
        const div = document.createElement("div");
        div.style.maxHeight = "80vh";
        div.style.overflowY = "auto";

        this.topic = topic;
        this.div = div;
        this.populate();
        this.scroll_to_bottom();
    }

    populate() {
        const self = this;
        const div = this.div;
        const topic = this.topic;

        div.innerHTML = "";

        const messages = model.messages_for_topic(topic);

        const rows: MessageInfo[] = [];

        let prev_sender_id: number | undefined;

        for (const message of messages) {
            let sender_id: number | undefined = message.sender_id;

            if (sender_id === prev_sender_id) {
                sender_id = undefined;
            } else {
                prev_sender_id = sender_id;
            }

            rows.push({ message, sender_id });
        }

        const smart_list = new SmartList({
            size: rows.length,
            get_div(index: number) {
                const { message, sender_id } = rows[index];
                const message_row = new MessageRow(message, sender_id);
                return message_row.div;
            },
            when_done() {
                self.scroll_to_bottom();
            },
        });

        div.append(smart_list.div);
    }

    scroll_to_bottom() {
        const div = this.div;

        div.scrollTop = div.scrollHeight - div.clientHeight;
    }
}
