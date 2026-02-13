import { MessagePane } from "./message_pane";
import { CurrentTopicList, TopicPane } from "./topic_pane";

type CallbackType = {
    clear_message_pane(): void;
    set_topic_index(index: number): void;
};

export class ChannelView {
    div: HTMLElement;
    stream_id: number;
    topic_pane: TopicPane;

    constructor(stream_id: number, callbacks: CallbackType) {
        this.stream_id = stream_id;

        this.topic_pane = new TopicPane({
            clear_message_pane(): void {
                callbacks.clear_message_pane();
            },
            set_topic_index(index: number): void {
                callbacks.set_topic_index(index);
            },
        });

        const div = document.createElement("div");
        div.style.display = "flex";

        this.topic_pane.populate(stream_id);
        div.append(this.topic_pane.div);

        this.div = div;
    }

    topic_selected(): boolean {
        return this.topic_pane.topic_selected();
    }

    open_message_pane(): void {
        const div = this.div;

        const topic = CurrentTopicList.get_current_topic();
        const message_pane = new MessagePane(topic!);

        div.innerHTML = "";
        div.append(this.topic_pane.div);
        div.append(message_pane.div);
    }

    clear_message_pane(): void {
        const div = this.div;
        CurrentTopicList.clear_selection();

        const topic = CurrentTopicList.get_current_topic();

        div.innerHTML = "";
        div.append(this.topic_pane.div);
    }

    set_topic_index(index: number): void {
        CurrentTopicList.select_index(index);
        this.open_message_pane();
    }

    surf_topics(): void {
        CurrentTopicList.surf();
        this.open_message_pane();
    }

    topic_up(): void {
        CurrentTopicList.up();
        this.open_message_pane();
    }

    topic_down(): void {
        CurrentTopicList.down();
        this.open_message_pane();
    }
}
