import type { RawMessage, Topic } from "./model";

import { MessageRow } from "./message_row";
import { MessageViewHeader } from "./message_view_header";
import * as model from "./model";

class MessageList {
    div: HTMLElement;
    topic: Topic;

    constructor(topic: Topic) {
        const div = document.createElement("div");
        div.style.maxHeight = "80vh";
        div.style.overflowY = "auto";

        this.topic = topic;
        this.div = div;
        this.populate();
    }

    populate() {
        const div = this.div;
        const topic = this.topic;

        div.innerHTML = "";

        const messages = model.messages_for_topic(topic);

        let prev_sender_id: number | undefined;

        for (const message of messages) {
            let sender_id: number | undefined = message.sender_id;

            if (sender_id === prev_sender_id) {
                sender_id = undefined;
            } else {
                prev_sender_id = sender_id;
            }

            const row = new MessageRow(message, sender_id);
            div.append(row.div);
        }
    }
}

export class MessagePane {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.innerHTML = "";

        const topic_line = new MessageViewHeader(topic.name, topic.msg_count);
        const message_list = new MessageList(topic);

        div.append(topic_line.div);
        div.append(message_list.div);

        this.div = div;
    }
}
