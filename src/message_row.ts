import type { RawMessage } from "./model";

import * as model from "./model";

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

export class MessageRow {
    div: HTMLElement;

    constructor(message: RawMessage, sender_id: number | undefined) {
        const div = document.createElement("div");

        div.style.paddingTop = "5px";
        div.style.marginBottom = "5px";
        div.style.borderBottom = "1px dotted #000080";
        div.style.maxWidth = "500px";
        div.style.fontSize = "16px";
        div.style.fontFamily = `"Source Sans 3 VF", sans-serif`
        div.style.color = "rgb(38, 38, 38)";
        div.style.lineHeight = "22.4px";

        if (sender_id) {
            const sender = new MessageSender(sender_id);
            div.append(sender.div);
        }

        div.append(render_message_content(message.content));

        this.div = div;
    }
}
