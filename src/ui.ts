import {
    get_current_bot_name,
    get_current_stream,
    get_current_topic,
    send_bot_message,
    set_current_bot,
    set_current_stream,
    set_current_topic,
} from "./main";
import { admin_bots, self_creds, ZulipAccount } from "./secrets";
import { get_user_details_by_email } from "./zulip_client";

class StatusBar {
    status_text?: string;
    status_bar_ele: HTMLElement;

    constructor(status_text?: string) {
        this.status_text = status_text;
        this.status_bar_ele = this.create_status_bar_ele();
    }

    create_status_bar_ele() {
        const ele = document.createElement("div");
        ele.textContent = this.status_text ?? "";
        return ele;
    }

    render() {
        document.body.append(this.status_bar_ele);
    }

    update_text(str: string) {
        this.status_bar_ele.textContent = str;
    }

    refresh_status_text() {
        this.update_text(
            "Active bot:" +
                get_current_bot_name() +
                " | Stream:" +
                get_current_stream() +
                " | Topic:" +
                get_current_topic(),
        );
    }
}

class MessageFeed {
    feed_container: HTMLElement;
    constructor() {
        this.feed_container = this.create_feed_container();
    }

    create_feed_container() {
        const container = document.createElement("div");
        const container_styles: Partial<CSSStyleDeclaration> = {
            maxHeight: "60vh",
            minHeight: "60vh",
            maxWidth: "78vw",
            backgroundColor: "lightgray",
            overflowY: "auto",
        };
        Object.assign(container.style, container_styles);

        return container;
    }
    render() {
        document.body.append(this.feed_container);
    }

    add_new_message(info: {
        sender_name: string;
        content: string;
        stream: string;
        topic: string;
    }) {
        const sender_name_ele = document.createElement("div");
        const content_ele = document.createElement("pre");

        const message_container = document.createElement("div");
        sender_name_ele.textContent =
            info.sender_name + " from " + info.stream + ">" + info.topic;
        content_ele.textContent = info.content;
        content_ele.style.whiteSpace = "pre-wrap";
        content_ele.style.overflowWrap = "break-word";
        message_container.append(sender_name_ele, content_ele);

        // Add hover styling, IGNORE
        message_container.style.transition =
            "background-color 150ms ease, transform 150ms ease";

        message_container.onmouseenter = () => {
            message_container.style.backgroundColor = "#f3f4f6";
            message_container.style.cursor = "pointer";
            message_container.title = `Click to set ${info.stream}>${info.topic} as the recipient`;
        };

        message_container.onmouseleave = () => {
            message_container.style.backgroundColor = "";
            message_container.style.transform = "";
        };

        message_container.addEventListener("click", () => {
            set_current_topic(info.topic);
            set_current_stream(info.stream);
            status_bar.refresh_status_text();
            stream_topic_input.update_both(info.stream, info.topic);
        });

        this.feed_container.append(message_container);
    }
}

const message_feed: MessageFeed = new MessageFeed();
const status_bar: StatusBar = new StatusBar();

export function show_status_bar() {
    status_bar.render();
}

export function show_message_feed() {
    message_feed.render();
}

export function show_composebox() {
    const textarea = document.createElement("textarea");
    textarea.style.width = "70%";
    textarea.placeholder = `Click send with an empty textbox to send a random cat phrase`;

    const send_btn = document.createElement("button");
    send_btn.innerText = "Send";
    send_btn.addEventListener("click", () => send_bot_message(textarea.value));

    document.body.append(textarea);
    document.body.append(send_btn);
}

class StreamTopicInput {
    input_container: HTMLDivElement;
    topic_input_ele: HTMLInputElement;
    stream_input_ele: HTMLInputElement;

    constructor() {
        this.input_container = this.create_input_container();
        this.topic_input_ele = this.create_topic_input_ele();
        this.stream_input_ele = this.create_stream_input_ele();

        this.input_container.append(
            this.stream_input_ele,
            this.topic_input_ele,
        );
    }

    render() {
        document.body.append(this.input_container);
    }

    create_input_container() {
        const input_container = document.createElement("div");
        return input_container;
    }

    create_topic_input_ele() {
        const topic_input = document.createElement("input");
        topic_input.placeholder = "Enter topic";

        topic_input.oninput = () => {
            const topic = topic_input.value;
            set_current_topic(topic);
            status_bar.refresh_status_text();
        };
        return topic_input;
    }

    create_stream_input_ele() {
        const stream_input = document.createElement("input");
        stream_input.placeholder = "Enter stream";

        stream_input.oninput = () => {
            const stream = stream_input.value;
            set_current_stream(stream);
            status_bar.refresh_status_text();
        };
        return stream_input;
    }

    update_topic(topic: string) {
        this.topic_input_ele.value = topic;
    }

    update_stream(stream: string) {
        this.stream_input_ele.value = stream;
    }

    update_both(stream: string, topic: string) {
        this.update_topic(topic);
        this.update_stream(stream);
    }
}

const stream_topic_input = new StreamTopicInput();

function show_stream_topic_input() {
    stream_topic_input.render();
    // To get around module evaluation when importing this in `main.ts`
    stream_topic_input.update_both(get_current_stream(), get_current_topic());
}

export function show_right_sidebar() {
    const self = self_creds;
    const bots = [self, ...admin_bots];
    const right_sidebar = document.createElement("div");
    Object.assign(right_sidebar.style, {
        position: "absolute",
        top: "0",
        right: "0",
        width: "20vw",
        height: "100%",
        marginTop: "1rem",
        backgroundColor: "slate",
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
    } satisfies Partial<CSSStyleDeclaration>);

    document.body.append(right_sidebar);

    for (const bot of bots) {
        const buddy_button = create_bot_button(bot);
        right_sidebar.append(buddy_button);

        // Fetch user details in background
        get_user_details_by_email(bot.email)
            .then((data) => {
                if (data?.avatar_url) {
                    hydrate_bot_avatar(buddy_button, bot, data.avatar_url);
                }
            })
            .catch((err) => {
                console.warn(
                    "Failed to fetch user details for",
                    bot.email,
                    err,
                );
            });
    }
}

function create_bot_button(bot: ZulipAccount): HTMLButtonElement {
    const bot_button = document.createElement("button");

    bot_button.style.display = "flex";
    bot_button.style.alignItems = "center";
    bot_button.style.gap = "0.5rem";

    const name_span = document.createElement("span");
    name_span.innerText = bot.name;
    bot_button.append(name_span);

    bot_button.addEventListener("click", () => {
        set_current_bot(bot);
        status_bar.refresh_status_text();
    });

    return bot_button;
}

function hydrate_bot_avatar(
    button: HTMLButtonElement,
    bot: ZulipAccount,
    avatar_url: string,
) {
    const img = document.createElement("img");

    img.width = 24;
    img.height = 24;
    img.style.borderRadius = "50%";
    img.style.objectFit = "cover";

    img.onload = () => {
        button.prepend(img);
    };

    img.onerror = () => {
        console.warn("Failed to load avatar for", bot.name);
    };

    img.src = avatar_url;
}

export function add_new_message_to_message_feed(info: {
    sender_name: string;
    content: string;
    stream: string;
    topic: string;
}) {
    message_feed.add_new_message({ ...info });
}

export function render_everything() {
    show_status_bar();
    status_bar.refresh_status_text();
    show_message_feed();
    show_composebox();
    show_stream_topic_input();
    show_right_sidebar();
}
