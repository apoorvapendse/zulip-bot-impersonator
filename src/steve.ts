import * as model from "./model";
import type {Stream, Topic} from "./model";
import {MessagePane} from "./message_pane";
import {config} from "./secrets";

function render_div_button(label: string): HTMLElement {
    const div = document.createElement("div");
    div.style.padding = "3px";

    const button = document.createElement("button");
    button.innerText = label;
    button.style.color = "white";
    button.style.backgroundColor = "#000080";

    button.addEventListener("focus", () => {
        button.style.backgroundColor = "green";
    });

    button.addEventListener("blur", () => {
        button.style.backgroundColor = "#000080";
    });


    div.append(button);
    return div;
}

function render_thead(headers: HTMLElement[]): HTMLElement {
    const thead = document.createElement("thead");

    const tr = document.createElement("tr");
    for (const th of headers) {
        tr.append(th);
    }
    thead.append(tr);

    return thead;
}

function render_th(label: string): HTMLElement {
    const th = document.createElement("th");
    th.innerText = label;
    th.style.position = "sticky";
    th.style.top = "0";
    th.style.backgroundColor = "white";
    th.style.zIndex = "999";
    th.style.textAlign = "left";
    th.style.fontWeight = "bold";
    th.style.color = "#000080";
    th.style.margin = "2px";
    return th;
}

function render_tr(divs: HTMLElement[]): HTMLElement {
    const tr = document.createElement("tr");

    for (const div of divs) {
        const td = document.createElement("td");
        td.style.verticalAlign = "bottom";
        td.style.padding = "4px";
        td.append(div);
        tr.append(td);
    }

    return tr;
}

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

function render_stream_heading(name: string): HTMLElement {
    const div = document.createElement("div");

    const text_div = document.createElement("div");
    text_div.innerText = name;
    text_div.style.display = "inline-block";
    text_div.style.paddingBottom = "4px";
    text_div.style.marginBottom = "12px";
    text_div.style.fontSize = "19px";
    text_div.style.borderBottom = "1px solid black";

    div.append(text_div)

    return div;
}

function render_big_list(): HTMLElement {
    const div = document.createElement("div");
    div.style.paddingRight = "5px";
    div.style.maxHeight = "80vh";
    div.style.overflowY = "auto";
    return div;
}

/**************************************************
 * cursor
 *
**************************************************/

class Cursor {
    selected_index?: number;
    count: number;

    constructor() {
        this.count = 0;
    }

    is_selecting(index: number): boolean {
        return this.selected_index === index;
    }

    set_count(count: number): void {
        this.count = count;
    }

    clear(): void {
        this.selected_index = undefined;
    }

    select_index(index: number) {
        this.selected_index = index;
    }

    down(): void {
        const count = this.count;
        this.selected_index = ((this.selected_index ?? -1) + 1) % count;

    }

    up(): void {
        if (this.selected_index === undefined || this.selected_index === 0) {
            return;
        }
        this.selected_index -= 1;
    }
}

/**************************************************
 * stream pane
 *
**************************************************/

class StreamRowName {
    div: HTMLElement;

    constructor(stream: Stream, index: number, selected: boolean) {
        const stream_name = stream.name;

        const div = render_stream_name(stream_name);

        div.addEventListener("click", () => {
            if (selected) {
                CurrentSearchWidget.clear_stream();
            } else {
                CurrentSearchWidget.set_stream_index(index);
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

let CurrentStreamList: StreamList;

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
        const thead = render_thead([
            render_th("Count"),
            render_th("Channel"),
        ]);

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

class StreamPane {
    div: HTMLElement;

    constructor() {
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
        div.append(render_stream_heading("Channels"));
        div.append(CurrentStreamList.div);
    }
}

/**************************************************
 * topic pane
 *
**************************************************/

class TopicRowName {
    div: HTMLElement;

    constructor(topic_name: string, index: number, selected: boolean) {
        const div = render_topic_name(topic_name);

        div.addEventListener("click", () => {
            if (selected) {
                CurrentSearchWidget.clear_topic();
            } else {
                CurrentSearchWidget.set_topic_index(index);
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

let CurrentTopicList: TopicList;

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

class TopicPane {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");

        div.style.marginRight = "45px";

        this.div = div;

        this.populate();
    }

    populate(): void {
        const div = this.div;

        const stream_id = CurrentStreamList.get_stream_id();

        if (stream_id === undefined) {
            div.innerHTML = "(no channel set)";
            return;
        }

        CurrentTopicList = new TopicList(stream_id);
        CurrentTopicList.populate();

        const stream_name = model.stream_name_for(stream_id);

        div.innerHTML = "";
        div.append(render_stream_heading(stream_name));
        div.append(CurrentTopicList.div);
    }
}

/**************************************************
 * search widget
 *
**************************************************/

let CurrentSearchWidget: SearchWidget;

class SearchWidget {
    div: HTMLElement;
    message_pane: MessagePane;
    stream_pane: StreamPane;
    topic_pane: TopicPane;
    button_panel: ButtonPanel;

    constructor() {
        const div = document.createElement("div");
        this.div = div;

        this.button_panel = new ButtonPanel();
        this.stream_pane = new StreamPane();
        this.topic_pane = new TopicPane();
        this.message_pane = new MessagePane();
    }

    populate(): void {
        const div = this.div;
        const button_panel = this.button_panel;

        div.innerHTML = "";

        div.append(button_panel.div);

        const main_section = this.build_main_section();
        div.append(main_section);
    }

    start() {
        this.button_panel.focus_first_button();
    }

    build_main_section(): HTMLElement {
        const div = document.createElement("div");
        div.style.display = "flex";

        div.append(this.stream_pane.div);
        div.append(this.topic_pane.div);
        div.append(this.message_pane.div);

        return div;
    }

    populate_message_pane(): void {
        const topic = CurrentTopicList.get_current_topic();
        this.message_pane.populate(topic);
    }


    set_stream_index(index: number): void {
        CurrentStreamList.select_index(index);
        this.topic_pane.populate();
        this.populate_message_pane();
    }

    clear_stream(): void {
        CurrentStreamList.clear_selection();
        this.topic_pane.populate();
        this.populate_message_pane();
    }

    stream_up(): void {
        CurrentStreamList.up();
        this.topic_pane.populate();
        this.populate_message_pane();
    }

    stream_down(): void {
        CurrentStreamList.down();
        this.topic_pane.populate();
        this.populate_message_pane();
    }

    set_topic_index(index: number): void {
        CurrentTopicList.select_index(index);
        this.populate_message_pane();
    }

    clear_topic(): void {
        CurrentTopicList.clear_selection();
        this.populate_message_pane();
    }

    topic_up(): void {
        CurrentTopicList.up();
        this.populate_message_pane();
    }

    topic_down(): void {
        CurrentTopicList.down();
        this.populate_message_pane();
    }
}

/**************************************************
 * buttons
 *
**************************************************/

function stream_up_button(): HTMLElement {
    const div = render_div_button("prev channel");

    div.addEventListener("click", () => {
        CurrentSearchWidget.stream_up();
    });

    return div;
}

function stream_down_button(): HTMLElement {
    const div = render_div_button("next channel");

    div.addEventListener("click", () => {
        CurrentSearchWidget.stream_down();
    });

    return div;
}

function stream_clear_button() {
    const div = render_div_button("clear channel");

    div.addEventListener("click", () => {
        CurrentSearchWidget.clear_stream();
    });

    return div;
}

function topic_up_button(): HTMLElement {
    const div = render_div_button("prev topic");

    div.addEventListener("click", () => {
        CurrentSearchWidget.topic_up();
    });

    return div;
}

function topic_down_button() {
    const div = render_div_button("next topic");

    div.addEventListener("click", () => {
        CurrentSearchWidget.topic_down();
    });

    return div;
}

function topic_clear_button() {
    const div = render_div_button("clear topic");

    div.addEventListener("click", () => {
        CurrentSearchWidget.clear_topic();
    });

    return div;
}

class ButtonPanel {
    div: HTMLElement;
    first_button: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.paddingBottom = "4px";

        div.append(stream_up_button());
        div.append(stream_down_button());
        div.append(stream_clear_button());

        div.append(topic_up_button());
        div.append(topic_down_button());
        div.append(topic_clear_button());

        this.first_button = div.querySelectorAll("button")[1];
        this.div = div;
    }

    focus_first_button() {
        console.log(this.first_button);
        this.first_button.focus();
    }
}


let ThePage: Page;

class Page {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.innerText = "loading users and recent messages...";
        div.style.marginLeft = "15px";
        document.body.append(div);

        this.div = div;
    }

    populate(inner_div: HTMLElement) {
        this.div.innerHTML = "";
        this.div.append(inner_div);
    }
}

export async function run() {
    document.title = config.nickname;

    // do before fetching to get "spinner"
    const ThePage = new Page();

    await model.fetch_model_data();

    CurrentSearchWidget = new SearchWidget();
    CurrentSearchWidget.populate();

    ThePage.populate(CurrentSearchWidget.div);
    CurrentSearchWidget.start();
}
