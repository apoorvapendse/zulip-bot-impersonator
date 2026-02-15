import type { Topic } from "./db_types";

import { Cursor } from "./cursor";
import * as model from "./model";
import {
    render_list_heading,
    render_thead,
    render_th,
    render_tr,
    render_big_list,
    render_pane,
} from "./render";
import { TopicList } from "./topic_list";

type CallbackType = {
    clear_message_view(): void;
    set_topic_index(index: number): void;
};

export class TopicPane {
    div: HTMLElement;
    topic_list: TopicList;

    constructor(stream_id: number, callbacks: CallbackType) {
        const div = render_pane();

        this.topic_list = new TopicList(stream_id, callbacks);
        this.topic_list.populate();

        const stream_name = model.stream_name_for(stream_id);

        div.innerHTML = "";
        div.append(render_list_heading(stream_name));
        div.append(this.topic_list.div);

        this.div = div;
    }

    topic_selected(): boolean {
        if (this.topic_list === undefined) {
            return false;
        }
        return this.topic_list.has_selection();
    }

    get_topic_list(): TopicList {
        return this.topic_list;
    }
}
