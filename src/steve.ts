import type { TopicList } from "./topic_list";

import * as model from "./model";
import * as zulip_client from "./zulip_client";
import { ButtonPanel } from "./nav_button_panel";
import { config } from "./secrets";
import { StreamList, StreamPane } from "./stream_pane";
import { ChannelView } from "./channel_view";
import { EventRadioWidgetSingleton } from "./event_radio";
import { PopupSingleton } from "./popup";

/**************************************************
 * search widget
 *
 **************************************************/

class SearchWidget {
    div: HTMLElement;
    button_panel: ButtonPanel;
    main_section: HTMLElement;
    stream_pane: StreamPane;
    channel_view?: ChannelView;
    channels_hidden: boolean;

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
            surf_topics(): void {
                self.surf_topics();
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

        this.main_section = this.build_main_section();
        this.show_only_channels();

        this.channels_hidden = false;
    }

    refresh(): void {
        console.log("refreshing in SearchWidget");
        if (this.channel_view) {
            this.channel_view.refresh();
        }
    }

    make_channel_view() {
        const self = this;

        const stream_id = this.get_stream_list().get_stream_id();
        this.channel_view = new ChannelView(stream_id!, {
            clear_message_view(): void {
                self.clear_message_view();
            },
            set_topic_index(index: number): void {
                self.set_topic_index(index);
            },
        });
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

    get_topic_list(): TopicList | undefined {
        if (this.channel_view === undefined) {
            return undefined;
        }
        return this.channel_view.get_topic_list();
    }

    topic_selected(): boolean {
        if (this.channel_view === undefined) {
            return false;
        }
        return this.channel_view.topic_selected();
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

        this.channel_view = undefined;
        this.channels_hidden = false;
    }

    show_channels(): void {
        const div = this.main_section;

        div.innerHTML = "";

        div.append(this.stream_pane.div);
        div.append(this.channel_view!.div);

        this.channels_hidden = false;
    }

    hide_channels(): void {
        const div = this.main_section;

        div.innerHTML = "";

        div.append(this.channel_view!.div);

        this.channels_hidden = true;
    }

    update_button_panel(): void {
        this.button_panel.update({
            stream_selected: this.stream_selected(),
            topic_selected: this.topic_selected(),
            channels_hidden: this.channels_hidden,
        });
    }

    get_stream_list(): StreamList {
        return this.stream_pane.get_stream_list();
    }

    set_stream_index(index: number): void {
        this.get_stream_list().select_index(index);
        this.make_channel_view();
        this.update_button_panel();
        this.show_channels();
        this.button_panel.focus_surf_topics_button();
    }

    clear_stream(): void {
        this.get_stream_list().clear_selection();
        this.show_only_channels();
        this.update_button_panel();
        this.button_panel.focus_next_channel_button();
    }

    stream_up(): void {
        this.get_stream_list().up();
        this.make_channel_view();
        this.show_channels();
        this.update_button_panel();
    }

    stream_down(): void {
        this.get_stream_list().down();
        this.make_channel_view();
        this.show_channels();
        this.update_button_panel();
    }

    clear_message_view(): void {
        this.channel_view!.clear_message_view();
        this.update_button_panel();
        this.button_panel.focus_surf_topics_button();
    }

    surf_channels(): void {
        const topic_list = this.get_topic_list();

        if (topic_list) {
            topic_list.clear_selection();
        }
        this.get_stream_list().surf();
        this.stream_pane.populate();
        this.make_channel_view();
        this.show_channels();
        this.update_button_panel();
        this.button_panel.focus_next_channel_button();
    }

    surf_topics(): void {
        this.channel_view!.surf_topics();
        this.hide_channels();
        this.update_button_panel();
        this.button_panel.focus_next_topic_button();
    }

    set_topic_index(index: number): void {
        this.channel_view!.set_topic_index(index);
        this.hide_channels();
        this.update_button_panel();
        this.button_panel.focus_next_topic_button();
    }

    topic_up(): void {
        this.channel_view!.topic_up();
        this.update_button_panel();
    }

    topic_down(): void {
        this.channel_view!.topic_down();
        this.update_button_panel();
    }
}

class Page {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.innerText =
            "Welcome to Zulip! loading users and recent messages...";
        div.style.marginLeft = "15px";

        document.body.append(div);

        this.div = div;
    }

    populate(inner_div: HTMLElement) {
        this.div.innerHTML = "";
        this.div.append(inner_div);
    }
}

export const event_radio_widget = new EventRadioWidgetSingleton();
export const Popup = new PopupSingleton();

export async function run() {
    document.title = config.nickname;

    document.body.style.backgroundColor = "rgb(246, 246, 255)";

    // do before fetching to get "spinner"
    const page = new Page();

    let ready = false;

    // we wait for register to finish, but then polling goes
    // on "forever" asynchronously
    await zulip_client.register_queue(() => {
        if (ready) {
            search_widget.refresh();
        } else {
            console.log("we were told to refresh before finishing fetch");
        }
    });

    await model.fetch_model_data();

    const search_widget = new SearchWidget();
    search_widget.populate();
    page.populate(search_widget.div);
    search_widget.start();

    ready = true;

    page.div.append(event_radio_widget.div);
}
