import type { Topic } from "./model";

import { Cursor } from "./cursor";
import * as model from "./model";
import {
    render_list_heading,
    render_thead,
    render_th,
    render_tr,
    render_big_list,
} from "./render";

let Callbacks: CallbackType;

type CallbackType = {
    clear_topic(): void;
    set_topic_index(index: number): void;
};

function render_topic_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `${count}`;
    div.style.textAlign = "right";

    return div;
}

function render_topic_name(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.maxWidth = "270px";
    div.style.overflowWrap = "break-word";
    div.style.color = "#000080";
    div.style.cursor = "pointer";

    return div;
}

class TopicRowName {
    div: HTMLElement;

    constructor(topic_name: string, index: number, selected: boolean) {
        const div = render_topic_name(topic_name);

        div.addEventListener("click", () => {
            if (selected) {
                Callbacks.clear_topic();
            } else {
                Callbacks.set_topic_index(index);
            }
        });

        if (selected) {
            div.style.backgroundColor = "cyan";
        }

        this.div = div;
    }
}

class TopicRow {
    tr: HTMLElement;

    constructor(topic: Topic, index: number, selected: boolean) {
        const topic_row_name = new TopicRowName(topic.name, index, selected);

        this.tr = render_tr([
            render_topic_count(topic.msg_count),
            topic_row_name.div,
        ]);
    }
}

export let CurrentTopicList: TopicList;

class TopicList {
    div: HTMLElement;
    topics: Topic[];
    cursor: Cursor;
    stream_id: number;

    constructor(stream_id: number) {
        const div = render_big_list();

        this.stream_id = stream_id;

        this.topics = [];
        this.cursor = new Cursor();

        this.div = div;
    }

    has_selection(): boolean {
        return this.cursor.has_selection();
    }

    get_current_topic(): Topic | undefined {
        const index = this.cursor.selected_index;

        if (index === undefined) return undefined;

        return this.topics[index];
    }

    make_thead(): HTMLElement {
        const thead = render_thead([
            render_th("Count"),
            render_th("Topic name"),
        ]);

        return thead;
    }

    get_topics(): Topic[] {
        const stream_id = this.stream_id!;
        const cursor = this.cursor;

        const max_recent = 5000;
        const topics = model.get_recent_topics(stream_id, max_recent);

        cursor.set_count(topics.length);

        this.topics = topics;

        return topics;
    }

    make_tbody(): HTMLElement {
        const cursor = this.cursor;
        const topics = this.get_topics();

        const tbody = document.createElement("tbody");

        for (let i = 0; i < topics.length; ++i) {
            const topic = topics[i];
            const selected = cursor.is_selecting(i);
            const topic_row = new TopicRow(topic, i, selected);
            tbody.append(topic_row.tr);
        }

        return tbody;
    }

    make_table(): HTMLElement {
        const thead = this.make_thead();
        const tbody = this.make_tbody();

        const table = document.createElement("table");
        table.append(thead);
        table.append(tbody);

        return table;
    }

    populate() {
        const div = this.div;

        if (this.stream_id === undefined) {
            div.innerHTML = "(no channel set)";
            return;
        }

        div.innerHTML = "";
        div.append(this.make_table());
    }

    select_index(index: number) {
        this.cursor.select_index(index);
        this.populate();
    }

    clear_selection(): void {
        this.cursor.clear();
        this.populate();
    }

    down(): void {
        this.cursor.down();
        this.populate();
    }

    up(): void {
        this.cursor.up();
        this.populate();
    }
}

export class TopicPane {
    div: HTMLElement;

    constructor(callbacks: CallbackType) {
        Callbacks = callbacks;

        const div = document.createElement("div");

        div.style.marginRight = "45px";

        this.div = div;
    }

    topic_selected(): boolean {
        if (CurrentTopicList === undefined) {
            return false;
        }
        return CurrentTopicList.has_selection();
    }

    populate(stream_id: number | undefined): void {
        const div = this.div;

        if (stream_id === undefined) {
            div.innerHTML = "(no channel set)";
            return;
        }

        CurrentTopicList = new TopicList(stream_id);
        CurrentTopicList.populate();

        const stream_name = model.stream_name_for(stream_id);

        div.innerHTML = "";
        div.append(render_list_heading(stream_name));
        div.append(CurrentTopicList.div);
    }
}
