import * as model from "./model";
import type {RawMessage, Topic} from "./model";

function render_topic_heading_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `(${count})`;
    div.style.padding = "3px";
    div.style.marginLeft = "3px";

    return div;
}

function render_topic_heading(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.color = "#000080";
    div.style.fontSize = "19px";

    return div;
}

function render_sender_name(sender_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = sender_name + " said:";
    div.style.fontWeight = "bold";
    div.style.fontSize = "15px";
    div.style.color = "#000080";
    div.style.marginTop = "2px";
    return div;
}

function render_avatar(avatar_url: string): HTMLElement {
    const div = document.createElement("div");
    const img = document.createElement("img");

    img.width = 20;
    img.height = 20;
    img.style.objectFit = "cover";

    img.src = avatar_url;

    div.append(img);

    return div;
}

function render_message_content(content: string): HTMLElement {
    const div = document.createElement("div");
    div.innerHTML = content;

    return div;
}


class MessageSender {
    div: HTMLElement;

    constructor(sender_id: number) {
        const div = document.createElement("div");
        div.style.display = "flex";

        const user = model.UserMap.get(sender_id);

        const avatar_url = user?.avatar_url;

        if (avatar_url) {
            div.append(render_avatar(avatar_url));
        }

        div.append(render_sender_name(user?.full_name ?? "unknown"));

        this.div = div;
    }
}

class MessageRow {
    div: HTMLElement;

    constructor(message: RawMessage, sender_id: number | undefined) {
        const div = document.createElement("div");

        div.style.paddingTop = "5px";
        div.style.marginBottom = "5px";
        div.style.borderBottom = "1px dotted #000080";
        div.style.maxWidth = "500px";

        if (sender_id) {
            const sender = new MessageSender(sender_id);
            div.append(sender.div);
        }

        div.append(render_message_content(message.content));

        this.div = div;
    }
}

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

class MessageTopicLine {
    div: HTMLElement;

    constructor(topic_name: string, topic_count: number) {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.borderBottom = "1px solid black";
        div.style.paddingBottom = "6px";
        div.style.marginBottom = "12px";

        div.append(render_topic_heading(topic_name));
        div.append(render_topic_heading_count(topic_count));

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

        const topic_line = new MessageTopicLine(topic.name, messages.length);

        const message_list = new MessageList(messages);

        div.append(topic_line.div);
        div.append(message_list.div);
    }
}

