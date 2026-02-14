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
    elem.style.width = "350px";
    elem.style.height = "250px";

    return elem;
}

function labeled_input(name: string, input: HTMLInputElement) {
    const label = document.createElement("label");

    const name_div = document.createElement("div");
    name_div.innerText = name;
    name_div.style.marginRight = "7px";
    name_div.style.marginBottom = "14px";
    name_div.style.display = "inline-block";

    label.append(name_div);
    label.append(input);

    return label;
}

class TopicInput {
    div: HTMLElement;
    topic_input: HTMLInputElement;

    constructor(topic_name: string) {
        const div = document.createElement("div");

        const topic_input = this.make_topic_input(topic_name);
        const label = labeled_input("Topic:", topic_input);

        div.append(label);

        this.topic_input = topic_input;
        this.div = div;
    }

    make_topic_input(topic_name: string): HTMLInputElement {
        const input = document.createElement("input");

        input.type = "text";
        input.placeholder = "topic";
        input.value = topic_name;
        input.style.width = "300px";

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

    clear(): void {
        this.elem.value = "";
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
        const div = document.createElement("div");

        div.style.display = "flex";
        div.style.justifyContent = "end";

        const send_button = new Button("Send", () => {
            // TODO: save draft
            const content = self.get_content_to_send();
            this.textarea.clear();
            self.send(content);
        });

        div.append(send_button.div);

        return div;
    }

    get_content_to_send(): string {
        return this.textarea.contents() + "\n\n*from steve client*";
    }

    send(content: string): void {
        const stream_id = this.topic.stream_id;
        const topic_name = this.topic_input.topic_name();

        send_message({ stream_id, topic_name, content });
    }
}
