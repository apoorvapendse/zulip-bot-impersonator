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
    textarea: TextArea;
    topic: Topic;

    constructor(topic: Topic) {
        const self = this;
        this.topic = topic;

        const div = document.createElement("div");
        div.style.padding = "15px";
        div.style.border = "1px black solid";

        const textarea = new TextArea();

        const send_button = new Button("Send", () => {
            self.send();
        });

        div.append(textarea.div);
        div.append(send_button.div);

        document.body.append(div);
        this.div = div;
        this.textarea = textarea;
    }

    send() {
        const stream_id = this.topic.stream_id;
        const topic_name = this.topic.name;

        console.log("send", stream_id, topic_name);

        const content = this.textarea.contents() + "\n\n*from steve client*";

        send_message({ stream_id, topic_name, content });
    }
}
