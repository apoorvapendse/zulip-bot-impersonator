type CallbackType = {
    stream_up(): void;
    stream_down(): void;
    surf_channels(): void;
    surf_topics(): void;
    topic_up(): void;
    topic_down(): void;
};

type DivButton = {
    div: HTMLElement;
    button: HTMLElement;
};

function render_div_button(label: string): DivButton {
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
    return { div, button };
}

class Button {
    div: HTMLElement;
    button: HTMLElement;
    width: string;

    constructor(label: string, callback: () => void) {
        const { div, button } = render_div_button(label);
        this.div = div;
        this.button = button;

        this.width = div.style.width;

        button.addEventListener("click", () => {
            callback();
        });

        this.show();
    }

    show(): void {
        this.div.style.visibility = "visible";
        this.div.style.width = this.width;
    }

    hide(): void {
        this.div.style.visibility = "hidden";
        this.div.style.width = "0px";
    }

    focus(): void {
        this.button.focus();
    }
}

export class ButtonPanel {
    div: HTMLElement;
    next_channel: Button;
    prev_channel: Button;
    next_topic: Button;
    prev_topic: Button;
    surf_topics: Button;
    surf_channels: Button;

    constructor(callbacks: CallbackType) {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.paddingBottom = "4px";

        this.next_channel = new Button("next channel", () => {
            callbacks.stream_down();
        });
        this.prev_channel = new Button("prev channel", () => {
            callbacks.stream_up();
        });

        this.surf_channels = new Button("surf channels", () => {
            callbacks.surf_channels();
        });

        this.surf_topics = new Button("surf topics", () => {
            callbacks.surf_topics();
        });

        this.next_topic = new Button("next topic", () => {
            callbacks.topic_down();
        });
        this.prev_topic = new Button("prev topic", () => {
            callbacks.topic_up();
        });

        div.append(this.next_channel.div);
        div.append(this.prev_channel.div);

        div.append(this.surf_channels.div);

        div.append(this.surf_topics.div);
        div.append(this.next_topic.div);
        div.append(this.prev_topic.div);

        this.div = div;
    }

    update(stream_selected: boolean, topic_selected: boolean): void {
        const div = this.div;

        function show_if(button: Button, cond: boolean): void {
            if (cond) {
                button.show()
            } else {
                button.hide();
            }
        }

        show_if(this.next_channel, !topic_selected);
        show_if(this.prev_channel, !topic_selected && stream_selected);

        show_if(this.surf_channels, topic_selected);

        show_if(this.surf_topics, stream_selected && !topic_selected);

        show_if(this.next_topic, topic_selected);
        show_if(this.prev_topic, topic_selected);
    }

    focus_next_channel_button(): void {
        this.next_channel.focus();
    }

    focus_next_topic_button(): void {
        this.next_topic.focus();
    }

    focus_surf_topics_button(): void {
        this.surf_topics.focus();
    }

    start(): void {
        this.next_channel.focus();
    }
}
