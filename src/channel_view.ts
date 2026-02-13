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
    message_pane: MessagePane;

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

        this.message_pane = new MessagePane();

        const div = document.createElement("div");
        div.style.display = "flex";

        div.append(this.topic_pane.div);
        div.append(this.message_pane.div);

        this.div = div;
    }

    populate_message_pane(): void {
        const topic = CurrentTopicList.get_current_topic();
        this.message_pane.populate(topic);
    }

    topic_selected(): boolean {
        return this.topic_pane.topic_selected();
    }

    populate(): void {
        const stream_id = this.stream_id;
        this.topic_pane.populate(stream_id);
    }

    clear_message_pane(): void {
        CurrentTopicList.clear_selection();
        this.populate_message_pane();
    }

    set_topic_index(index: number): void {
        CurrentTopicList.select_index(index);
        this.populate_message_pane();
    }

    surf_topics(): void {
        CurrentTopicList.surf();
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
