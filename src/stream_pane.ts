import type { Stream, StreamInfo } from "./model";

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

let Callbacks: CallbackType;

type CallbackType = {
    clear_stream(): void;
    set_stream_index(index: number): void;
};

function render_stream_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `${count}`;
    div.style.textAlign = "right";

    return div;
}

function render_stream_name(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.maxWidth = "270px";
    div.style.overflowWrap = "break-word";
    div.style.color = "#000080";
    div.style.cursor = "pointer";

    return div;
}

class StreamRowName {
    div: HTMLElement;

    constructor(stream: Stream, index: number, selected: boolean, callbacks: CallbackType) {
        const stream_name = stream.name;

        const div = render_stream_name(stream_name);

        div.addEventListener("click", () => {
            if (selected) {
                callbacks.clear_stream();
            } else {
                callbacks.set_stream_index(index);
            }
        });

        if (selected) {
            div.style.backgroundColor = "cyan";
        }

        this.div = div;
    }
}

class StreamRow {
    tr: HTMLElement;

    constructor(stream_info: StreamInfo, index: number, selected: boolean, callbacks: CallbackType) {
        const stream = stream_info.stream;
        const stream_row_name = new StreamRowName(stream, index, selected, callbacks);

        this.tr = render_tr([
            render_stream_count(stream_info.num_messages),
            stream_row_name.div,
        ]);
    }
}

export class StreamList {
    callbacks: CallbackType;
    div: HTMLElement;
    stream_ids: number[];
    cursor: Cursor;

    constructor(callbacks: CallbackType) {
        const div = render_big_list();

        this.stream_ids = [];
        this.cursor = new Cursor();
        this.get_streams();

        this.callbacks = callbacks;
        this.div = div;
    }

    has_selection(): boolean {
        return this.cursor.has_selection();
    }

    get_stream_id(): number | undefined {
        const index = this.cursor.selected_index;

        if (index === undefined) return undefined;

        return this.stream_ids[index];
    }

    make_thead(): HTMLElement {
        const thead = render_thead([render_th("Count"), render_th("Channel")]);

        return thead;
    }

    sort(stream_infos: StreamInfo[]) {
        stream_infos.sort((s1, s2) => s2.num_messages - s1.num_messages);
    }

    get_streams(): StreamInfo[] {
        const cursor = this.cursor;

        const stream_infos = model.get_streams();
        this.sort(stream_infos);

        cursor.set_count(stream_infos.length);

        this.stream_ids = stream_infos.map(
            (stream_info) => stream_info.stream.stream_id,
        );

        return stream_infos;
    }

    make_tbody(): HTMLElement {
        const callbacks = this.callbacks;
        const cursor = this.cursor;
        const streams = this.get_streams();

        const tbody = document.createElement("tbody");

        for (let i = 0; i < streams.length; ++i) {
            const stream = streams[i];
            const selected = cursor.is_selecting(i);
            const stream_row = new StreamRow(stream, i, selected, callbacks);
            tbody.append(stream_row.tr);
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

    surf(): void {
        this.cursor.first();
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

export class StreamPane {
    div: HTMLElement;
    stream_list: StreamList;

    constructor(callbacks: CallbackType) {
        const div = render_pane();

        this.stream_list = new StreamList(callbacks);

        this.div = div;
        this.populate();
    }

    stream_selected(): boolean {
        return this.stream_list.has_selection();
    }

    get_stream_list(): StreamList {
        return this.stream_list;
    }

    populate() {
        const div = this.div;
        const stream_list = this.stream_list;

        stream_list.populate();

        div.innerHTML = "";
        div.append(render_list_heading("Channels"));
        div.append(stream_list.div);
    }
}
