import type { Stream } from "./model";

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

    constructor(stream: Stream, index: number, selected: boolean) {
        const stream_name = stream.name;

        const div = render_stream_name(stream_name);

        div.addEventListener("click", () => {
            if (selected) {
                Callbacks.clear_stream();
            } else {
                Callbacks.set_stream_index(index);
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

    constructor(stream: Stream, index: number, selected: boolean) {
        const stream_row_name = new StreamRowName(stream, index, selected);

        this.tr = render_tr([
            render_stream_count(model.num_messages_for_stream(stream)),
            stream_row_name.div,
        ]);
    }
}

export let CurrentStreamList: StreamList;

class StreamList {
    div: HTMLElement;
    streams: Stream[];
    cursor: Cursor;

    constructor() {
        const div = render_big_list();

        this.streams = [];
        this.cursor = new Cursor();

        this.div = div;
    }

    get_stream_id(): number | undefined {
        const index = this.cursor.selected_index;

        if (index === undefined) return undefined;

        return this.streams[index].stream_id;
    }

    make_thead(): HTMLElement {
        const thead = render_thead([render_th("Count"), render_th("Channel")]);

        return thead;
    }

    get_streams(): Stream[] {
        const cursor = this.cursor;

        const streams = model.Streams;

        cursor.set_count(streams.length);

        this.streams = streams;

        return streams;
    }

    make_tbody(): HTMLElement {
        const cursor = this.cursor;
        const streams = this.get_streams();

        const tbody = document.createElement("tbody");

        for (let i = 0; i < streams.length; ++i) {
            const stream = streams[i];
            const selected = cursor.is_selecting(i);
            const stream_row = new StreamRow(stream, i, selected);
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

    constructor(callbacks: CallbackType) {
        Callbacks = callbacks;

        const div = document.createElement("div");

        div.style.marginRight = "45px";

        CurrentStreamList = new StreamList();

        this.div = div;
        this.populate();
    }

    populate() {
        const div = this.div;

        CurrentStreamList.populate();

        div.innerHTML = "";
        div.append(render_list_heading("Channels"));
        div.append(CurrentStreamList.div);
    }
}
