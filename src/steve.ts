import * as model from "./model";
import { MessagePane } from "./message_pane";
import { ButtonPanel } from "./nav_button_panel";
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

/**************************************************
 * search widget
 *
 **************************************************/

let CurrentSearchWidget: SearchWidget;

class SearchWidget {
    div: HTMLElement;
    button_panel: ButtonPanel;
    main_section: HTMLElement;
    stream_pane: StreamPane;
    topic_pane: TopicPane;
    message_pane: MessagePane;

    constructor() {
        const self = this;

        const div = document.createElement("div");

        this.div = div;

        this.button_panel = new ButtonPanel({
            stream_up(): void {
                self.stream_up();
            },
            stream_down(): void {
                self.stream_down();
            },
            surf_channels(): void {
                self.surf_channels();
            },
            topic_up(): void {
                self.topic_up();
            },
            topic_down(): void {
                self.topic_down();
            },
        });

        this.stream_pane = new StreamPane({
            clear_stream(): void {
                self.clear_stream();
            },
            set_stream_index(index: number): void {
                self.set_stream_index(index);
            },
        });

        this.topic_pane = new TopicPane({
            surf_channels(): void {
                self.surf_channels();
            },
            set_topic_index(index: number): void {
                self.set_topic_index(index);
            },
        });

        this.message_pane = new MessagePane();

        this.main_section = this.build_main_section();
        this.show_channels();
    }

    populate(): void {
        const div = this.div;
        const button_panel = this.button_panel;

        div.innerHTML = "";

        div.append(button_panel.div);

        div.append(this.main_section);
    }

    start() {
        this.update_button_panel();
        this.button_panel.start();
    }

    topic_selected(): boolean {
        return this.topic_pane.topic_selected();
    }

    stream_selected(): boolean {
        return this.stream_pane.stream_selected();
    }

    build_main_section(): HTMLElement {
        const div = document.createElement("div");
        div.style.display = "flex";
        return div;
    }

    show_only_channels(): void {
        const div = this.main_section;

        div.innerHTML = "";

        div.append(this.stream_pane.div);
    }

    show_channels(): void {
        const div = this.main_section;

        div.innerHTML = "";

        div.append(this.stream_pane.div);
        div.append(this.topic_pane.div);
    }

    hide_channels(): void {
        const div = this.main_section;

        div.innerHTML = "";

        div.append(this.topic_pane.div);
        div.append(this.message_pane.div);
    }

    populate_topic_pane(): void {
        const stream_id = CurrentStreamList.get_stream_id();
        this.topic_pane.populate(stream_id);
    }

    populate_message_pane(): void {
        const topic = CurrentTopicList.get_current_topic();
        this.message_pane.populate(topic);
    }

    update_button_panel(): void {
        this.button_panel.update(this.stream_selected(), this.topic_selected());
    }

    set_stream_index(index: number): void {
        CurrentStreamList.select_index(index);
        this.populate_topic_pane();
        this.update_button_panel();
        this.show_channels();
        this.button_panel.focus_next_topic_button();
    }

    clear_stream(): void {
        CurrentStreamList.clear_selection();
        this.show_only_channels();
        this.update_button_panel();
        this.button_panel.focus_next_channel_button();
    }

    stream_up(): void {
        CurrentStreamList.up();
        this.populate_topic_pane();
        this.populate_message_pane();
        this.update_button_panel();
    }

    stream_down(): void {
        CurrentStreamList.down();
        this.populate_topic_pane();
        this.populate_message_pane();
        this.update_button_panel();
    }

    set_topic_index(index: number): void {
        CurrentTopicList.select_index(index);
        this.populate_message_pane();
        this.update_button_panel();
        this.hide_channels();
    }

    surf_channels(): void {
        CurrentTopicList.clear_selection();
        this.populate_message_pane();
        this.update_button_panel();
        this.button_panel.focus_next_topic_button();
        this.show_channels();
    }

    topic_up(): void {
        CurrentTopicList.up();
        this.populate_message_pane();
        this.update_button_panel();
    }

    topic_down(): void {
        CurrentTopicList.down();
        this.populate_message_pane();
        this.update_button_panel();
        this.hide_channels();
    }
}

let ThePage: Page;

class Page {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.innerText = "Welcome to Zulip! loading users and recent messages...";
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
