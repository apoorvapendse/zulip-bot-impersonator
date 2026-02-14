import { ComposeBox } from "./compose";
import { Topic } from "./model";
import { render_list_heading } from "./render";

function render_heading(): HTMLElement {
    const div = render_list_heading("Send message to topic");
    div.style.color = "green";

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
