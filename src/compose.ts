import { Button } from "./button";
import { Topic } from "./model";
import { config } from "./secrets";

type SendInfo = {
    stream_id: number;
    topic_name: string;
    content: string;
};

function render_textarea(): HTMLTextAreaElement {
    const elem = document.createElement("textarea");
    elem.placeholder = "Enter some text to send.";
    elem.style.width = "450px";
    elem.style.height = "300px";
    elem.style.resize = "none";
    elem.style.zIndex = "100";

    return elem;
}

class TopicInput {
    div: HTMLElement;
    topic_input: HTMLInputElement;

    constructor(topic_name: string) {
        const div = document.createElement("div");

        const topic_input = this.make_topic_input(topic_name);
        div.append(topic_input);

        this.topic_input = topic_input;
        this.div = div;
    }

    make_topic_input(topic_name: string): HTMLInputElement {
        const input = document.createElement("input");

        input.type = "text";
        input.value = topic_name;
        input.style.width = "100px";

        return input;
    }

    topic_name(): string {
        return this.topic_input.value;
    }
}

class TextArea {
    div: HTMLElement;
    elem: HTMLTextAreaElement;

    constructor() {
        const div = document.createElement("div");

        const elem = render_textarea();
        div.append(elem);

        this.div = div;
        this.elem = elem;
    }

    contents(): string {
        return this.elem.value;
    }
}

async function send_message(info: SendInfo): Promise<void> {
    const body = new URLSearchParams({
        type: "stream",
        to: `${info.stream_id}`,
        topic: info.topic_name,
        content: info.content,
    });

    const email = config.user_creds.email;
    const api_key = config.user_creds.api_key;

    const credentials = btoa(`${email}:${api_key}`);
    const api_url = `${config.realm_url}/api/v1/messages`;

    const response = await fetch(api_url, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    });

    const data = await response.json();
    console.log(data);
}

export class ComposeBox {
    div: HTMLElement;
    topic_input: TopicInput;
    textarea: TextArea;
    topic: Topic;

    constructor(topic: Topic) {
        const self = this;
        this.topic = topic;

        const div = document.createElement("div");
        div.style.padding = "15px";

        const topic_input = new TopicInput(topic.name);

        const textarea = new TextArea();

        div.append(topic_input.div);
        div.append(textarea.div);
        div.append(self.button_row());

        document.body.append(div);

        this.topic_input = topic_input;
        this.div = div;
        this.textarea = textarea;
    }

    button_row(): HTMLElement {
        const self = this;
        const div = document.createElement("div")

        div.style.display = "flex";
        div.style.justifyContent = "end";

        const send_button = new Button("Send", () => {
            self.send();
        });

        div.append(send_button.div);

        return div;
    }

    send() {
        const stream_id = this.topic.stream_id;
        const topic_name = this.topic_input.topic_name();

        console.log("send", stream_id, topic_name);

        const content = this.textarea.contents() + "\n\n*from steve client*";

        send_message({ stream_id, topic_name, content });
    }
}
