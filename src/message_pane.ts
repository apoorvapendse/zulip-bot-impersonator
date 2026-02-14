import type { Topic } from "./model";

import { MessageList } from "./message_list";
import { MessageViewHeader } from "./message_view_header";

export class MessagePane {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.innerHTML = "";
        div.style.marginRight = "45px";

        const topic_line = new MessageViewHeader(topic.name, topic.msg_count);
        const message_list = new MessageList(topic);

        div.append(topic_line.div);
        div.append(message_list.div);

        this.div = div;
    }
}
