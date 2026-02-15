import type { RawMessage, RawStreamMessage, Topic } from "./model";

import { MessageRow } from "./message_row";
import * as model from "./model";
import { SmartList } from "./smart_list";

type MessageInfo = {
    message: model.RawMessage;
    sender_id: number | undefined;
};

export class MessageList {
    div: HTMLElement;
    topic: Topic;
    smart_list: SmartList;

    constructor(topic: Topic) {
        const div = document.createElement("div");
        div.style.maxHeight = "80vh";
        div.style.overflowY = "auto";

        this.topic = topic;
        this.div = div;

        const smart_list = this.populate();
        this.scroll_to_bottom();

        this.smart_list = smart_list;
    }

    refresh(raw_stream_message: RawStreamMessage) {
        if (raw_stream_message.topic_name === this.topic.name) {
            const sender_id = raw_stream_message.sender_id;
            const is_super_new = true;
            const message_row = new MessageRow(raw_stream_message, sender_id, is_super_new);

            const was_near_bottom = this.near_bottom();

            this.smart_list.append(message_row.div);

            if (was_near_bottom) {
                this.scroll_to_bottom();
            }
        }
    }

    populate(): SmartList {
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
                const is_super_new = false;
                const message_row = new MessageRow(message, sender_id, is_super_new);
                return message_row.div;
            },
            when_done() {
                self.scroll_to_bottom();
            },
        });

        div.append(smart_list.div);

        return smart_list;
    }

    near_bottom(): boolean {
        const div = this.div;
        console.log(div.scrollTop);
        console.log(div.scrollHeight);
        console.log(div.clientHeight);

        return div.scrollTop > div.scrollHeight - div.clientHeight - 10;
    }

    scroll_to_bottom() {
        const div = this.div;

        div.scrollTop = div.scrollHeight - div.clientHeight;
    }
}
