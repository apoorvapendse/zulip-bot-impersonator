import type { RawStreamMessage, Topic } from "./db_types";

import { MessageList } from "./message_list";
import { MessageViewHeader } from "./message_view_header";
import { render_pane } from "./render";

export class MessagePane {
    div: HTMLElement;
    message_list: MessageList;

    constructor(topic: Topic) {
        const div = render_pane();

        div.innerHTML = "";
        div.style.minWidth = "350px";

        const topic_line = new MessageViewHeader(topic.name, topic.msg_count);
        const message_list = new MessageList(topic);

        div.append(topic_line.div);
        div.append(message_list.div);

        this.div = div;
        this.message_list = message_list;
    }

    refresh(raw_stream_message: RawStreamMessage) {
        this.message_list.refresh(raw_stream_message);
    }
}
