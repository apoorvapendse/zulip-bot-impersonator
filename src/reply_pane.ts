import type { Topic } from "./model";

import { ComposeBox } from "./compose";
import * as model from "./model";
import { render_list_heading, render_pane } from "./render";

function render_heading(stream_name: string): HTMLElement {
    const title = `Send message to channel: ${stream_name}`;
    const div = render_list_heading(title);

    div.style.color = "green";

    return div;
}

export class ReplyPane {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = render_pane();

        div.innerHTML = "";

        const stream_name = model.stream_name_for(topic.stream_id);
        div.append(render_heading(stream_name));

        const compose_box = new ComposeBox(topic);
        div.append(compose_box.div);

        this.div = div;
    }
}
