import { TopicPane } from "./topic_pane";

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

       div.append(this.topic_pane.div);

       this.div = div;
    }

    topic_selected(): boolean {
        return this.topic_pane.topic_selected();
    }

    populate(): void {
        const stream_id = this.stream_id;
        this.topic_pane.populate(stream_id);
    }
}
