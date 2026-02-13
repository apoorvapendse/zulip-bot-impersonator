import type { RawMessage, Topic } from "./model";

import { MessageRow } from "./message_row";
import { MessageViewHeader } from "./message_view_header";
import * as model from "./model";

class MessageList {
    div: HTMLElement;

    constructor(messages: RawMessage[]) {
        const div = document.createElement("div");
        div.style.maxHeight = "80vh";
        div.style.overflowY = "auto";

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

        this.div = div;
    }
}

export class MessagePane {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");

        this.div = div;
    }

    populate(topic: Topic | undefined): void {
        const div = this.div;

        if (topic === undefined) {
            div.innerText = "(no topic selected)";
            return;
        }

        const messages = model.messages_for_topic(topic);

        div.innerHTML = "";

        const topic_line = new MessageViewHeader(topic.name, messages.length);

        const message_list = new MessageList(messages);

        div.append(topic_line.div);
        div.append(message_list.div);
    }
}
