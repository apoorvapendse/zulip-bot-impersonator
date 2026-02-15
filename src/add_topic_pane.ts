import { ComposeBox } from "./compose";
import { Topic } from "./db_types";
import * as model from "./model";
import { render_list_heading, render_pane } from "./render";

function render_heading(stream_name: string): HTMLElement {
    const title = `Start new topic on channel: ${stream_name}`;
    const div = render_list_heading(title);

    div.style.color = "violet";

    return div;
}

export class AddTopicPane {
    div: HTMLElement;
    compose_box: ComposeBox;

    constructor(stream_id: number) {
        const div = render_pane();

        div.innerHTML = "";
        div.style.height = "fit-content";

        const stream_name = model.stream_name_for(stream_id);
        div.append(render_heading(stream_name));

        const blank_name = "";
        const topic = new Topic(stream_id, blank_name);
        const compose_box = new ComposeBox(topic);
        div.append(compose_box.div);

        this.div = div;
        this.compose_box = compose_box;
    }

    focus_compose_box(): void {
        this.compose_box.focus_topic_input();
    }
}
