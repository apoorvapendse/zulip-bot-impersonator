import { ComposeBox } from "./compose";
import { Topic } from "./model";

function render_heading(): HTMLElement {
    const div = document.createElement("div");
    div.innerText = "Send message to topic";
    div.style.color = "green";
    div.style.borderBottom = "1px solid green";
    div.style.paddingBottom = "10px";
    div.style.marginBottom = "13px";

    return div;
}

export class ReplyPane {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.innerHTML = "";

        const compose_box = new ComposeBox(topic);

        div.append(render_heading());
        div.append(compose_box.div);

        this.div = div;
    }
}
