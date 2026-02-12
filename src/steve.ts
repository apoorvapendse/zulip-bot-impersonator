import * as model from "./model";
import { MessagePane } from "./message_pane";
import {
    render_list_heading,
    render_thead,
    render_th,
    render_tr,
    render_big_list,
} from "./render";
import { config } from "./secrets";
import { CurrentStreamList, StreamPane } from "./stream_pane";
import { CurrentTopicList, TopicPane } from "./topic_pane";

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
        const self = this;

        const div = document.createElement("div");

        this.div = div;

        this.button_panel = new ButtonPanel();
        this.stream_pane = new StreamPane({
            clear_stream(): void {
                self.clear_stream();
            },
            set_stream_index(index: number): void {
                self.set_stream_index(index);
            },
        });
        this.topic_pane = new TopicPane({
            clear_topic(): void {
                self.clear_topic();
            },
            set_topic_index(index: number): void {
                self.set_topic_index(index);
            },
        });
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

    populate_topic_pane(): void {
        const stream_id = CurrentStreamList.get_stream_id();
        this.topic_pane.populate(stream_id);
    }

    populate_message_pane(): void {
        const topic = CurrentTopicList.get_current_topic();
        this.message_pane.populate(topic);
    }

    set_stream_index(index: number): void {
        CurrentStreamList.select_index(index);
        this.populate_topic_pane();
        this.populate_message_pane();
    }

    clear_stream(): void {
        CurrentStreamList.clear_selection();
        this.populate_topic_pane();
        this.populate_message_pane();
    }

    stream_up(): void {
        CurrentStreamList.up();
        this.populate_topic_pane();
        this.populate_message_pane();
    }

    stream_down(): void {
        CurrentStreamList.down();
        this.populate_topic_pane();
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
