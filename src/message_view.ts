import type { RawStreamMessage, Topic } from "./db_types";

import { MessagePane } from "./message_pane";
import { ReplyPane } from "./reply_pane";

export class MessageView {
    div: HTMLElement;
    message_pane: MessagePane;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.innerHTML = "";
        div.style.display = "flex";

        const message_pane = new MessagePane(topic);
        div.append(message_pane.div);

        const reply_pane = new ReplyPane(topic);
        div.append(reply_pane.div);

        this.div = div;
        this.message_pane = message_pane;
    }

    refresh(raw_stream_message: RawStreamMessage) {
        this.message_pane.refresh(raw_stream_message);
    }
}
