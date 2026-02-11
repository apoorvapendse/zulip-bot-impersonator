import * as zulip_client from "./zulip_client";

function render_topic_heading_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `(${count})`;
    div.style.padding = "3px";
    div.style.marginLeft = "3px";

    return div;
}

function render_topic_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `${count}`;
    div.style.padding = "3px";
    div.style.marginRight = "3px";
    div.style.width = "20px";
    div.style.textAlign = "right";

    return div;
}

function render_topic_name(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.maxWidth = "270px";
    div.style.overflowWrap = "break-word";
    div.style.padding = "3px";
    div.style.marginBottom = "4px";
    div.style.color = "#000080";
    div.style.cursor = "pointer";

    return div;
}

function render_stream_heading(name: string): HTMLElement {
    const div = document.createElement("div");

    const text_div = document.createElement("div");
    text_div.innerText = name;
    text_div.style.display = "inline-block";
    text_div.style.paddingBottom = "4px";
    text_div.style.marginBottom = "12px";
    text_div.style.fontSize = "19px";
    text_div.style.borderBottom = "1px solid black";

    div.append(text_div)

    return div;
}

function render_topic_heading(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.color = "#000080";
    div.style.fontSize = "19px";

    return div;
}

function render_sender(sender_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = sender_name + " said:";
    div.style.fontWeight = "bold";
    div.style.fontSize = "15px";
    div.style.color = "#000080";
    div.style.marginTop = "2px";
    return div;
}

function render_message_content(content: string): HTMLElement {
    const div = document.createElement("div");
    div.innerHTML = content;

    return div;
}

class TopicRowName {
    div: HTMLElement;

    constructor(topic_name: string, index: number, selected: boolean) {
        const div = render_topic_name(topic_name);

        div.addEventListener("click", () => {
            if (selected) {
                CurrentSearchWidget.clear_topic();
            } else {
                CurrentSearchWidget.set_topic_name(index, topic_name);
            }
        });

        if (selected) {
            div.style.backgroundColor = "cyan";
        }

        this.div = div;
    }
}

class TopicRow {
    div: HTMLElement;

    constructor(topic: Topic, index: number, selected: boolean) {
        const div = document.createElement("div");

        div.style.display = "flex";

        const topic_row_name = new TopicRowName(topic.name, index, selected);

        div.append(render_topic_count(topic.msg_count));
        div.append(topic_row_name.div);

        this.div = div;
    }
}

class TopicList {
    div: HTMLElement;
    max_recent: number;
    selected_index?: number;

    constructor() {
        const div = document.createElement("div");
        this.max_recent = 20;

        div.style.marginRight = "15px";

        this.div = div;
        this.populate();
    }

    populate() {
        const max_recent = this.max_recent;
        const topics = CurrentTopicTable.get_topics(max_recent);
        const div = this.div;

        div.innerHTML = "";

        div.append(render_stream_heading(favorite_stream_name));

        for (let i = 0; i < topics.length; ++i) {
            const topic = topics[i];
            const selected = i === this.selected_index;
            const topic_row = new TopicRow(topic, i, selected);
            div.append(topic_row.div);
        }
    }

    select_index(index: number) {
        this.selected_index = index;
        this.populate();
    }

    clear_selection(): void {
        this.selected_index = undefined;
        this.populate();
    }
}

class MessageSender {
    div: HTMLElement;

    constructor(sender_id: number) {
        const div = document.createElement("div");

        const sender_name = get_user_name(sender_id);
        div.append(render_sender(sender_name));

        this.div = div;
    }
}

class MessageRow {
    div: HTMLElement;

    constructor(message: RawMessage, sender_id: number | undefined) {
        const div = document.createElement("div");

        div.style.paddingTop = "5px";
        div.style.marginBottom = "5px";
        div.style.borderBottom = "1px dotted #000080";
        div.style.maxWidth = "500px";

        if (sender_id) {
            const sender = new MessageSender(sender_id);
            div.append(sender.div);
        }

        div.append(render_message_content(message.content));

        this.div = div;
    }
}

class MessageList {
    div: HTMLElement;

    constructor(messages: RawMessage[]) {
        const div = document.createElement("div");

        let prev_sender_id: number | undefined;

        for (const message of messages) {
            let sender_id: number | undefined = message.sender_id;

            if (sender_id === prev_sender_id) {
                sender_id = undefined;
            } else {
                prev_sender_id = sender_id;
            }

            const row = new MessageRow(message, sender_id);
            div.append(row.div);
        }

        this.div = div;
    }
}

class TopicLine {
    div: HTMLElement;

    constructor(topic_name: string, topic_count: number) {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.borderBottom = "1px solid black";
        div.style.paddingBottom = "6px";
        div.style.marginBottom = "12px";

        div.append(render_topic_heading(topic_name));
        div.append(render_topic_heading_count(topic_count));

        this.div = div;
    }
}

class MessagePane {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");

        this.div = div;
        this.clear();
    }

    clear(): void {
        const div = this.div;

        div.innerText = "(no topic selected)";
    }

    set_topic_name(topic_name: string): void {
        const div = this.div;

        const messages = CurrentMessageStore.message_for_topic_name(topic_name);

        div.innerHTML = "";

        const topic_line = new TopicLine(topic_name, messages.length);

        const message_list = new MessageList(messages);

        div.append(topic_line.div);
        div.append(message_list.div);
    }
}

let CurrentSearchWidget: SearchWidget;

class SearchWidget {
    div: HTMLElement;
    message_pane: MessagePane;
    topic_list: TopicList;

    constructor() {
        const div = document.createElement("div");
        div.style.display = "flex";
        this.div = div;

        this.message_pane = new MessagePane();
        this.topic_list = new TopicList();
    }

    populate(): void {
        const div = this.div;

        div.innerHTML = "";

        div.append(this.topic_list.div);
        div.append(this.message_pane.div);
    }

    set_topic_name(index: number, topic_name: string): void {
        this.topic_list.select_index(index);
        this.message_pane.set_topic_name(topic_name);
    }

    clear_topic(): void {
        this.topic_list.clear_selection();
        this.message_pane.clear();
    }
}

/**************************************************
 * model code below, please!
 *
**************************************************/

const BATCH_SIZE = 1000;
const favorite_stream_name = "apoorva/showell projects";

type RawMessage = {
    id: number;
    topic_name: string;
    sender_id: number;
    content: string;
};

type RawStream = {
    stream_id: number;
    name: string;
};

type RawUser = {
    id: number;
    full_name: string;
};

let UserMap = new Map<number, RawUser>();

let RawMessages: RawMessage[];

let CurrentMessageStore: MessageStore;

class MessageStore {
    raw_messages: RawMessage[];

    constructor(raw_messages: RawMessage[]) {
        console.log("building message store");
        this.raw_messages = raw_messages;
    }

    message_for_topic_name(topic_name: string) {
        return this.raw_messages.filter((raw_message) => {
            return raw_message.topic_name === topic_name;
        });
    }
}

class Topic {
    name: string;
    last_msg_id: number;
    msg_count: number

    constructor(name: string) {
        this.name = name;
        this.msg_count = 0;
        this.last_msg_id = -1;
    }

    update_last_message(msg_id: number): void {
        if (msg_id > this.last_msg_id)  {
            this.last_msg_id = msg_id;
        }
        this.msg_count += 1;
    }
}

let CurrentTopicTable: TopicTable;

class TopicTable {
    map: Map<string, Topic>;

    constructor() {
        this.map = new Map<string, Topic>();

        for (const message of CurrentMessageStore.raw_messages) {
            const topic_name = message.topic_name;
            const msg_id = message.id;

            const topic = this.get_or_create(topic_name, msg_id);

            topic.update_last_message(msg_id);
        }
    }

    get_or_create(topic_name: string, msg_id: number): Topic {
        const map = this.map;
        const topic = map.get(topic_name);

        if (topic !== undefined) return topic;

        const new_topic = new Topic(topic_name);
        map.set(topic_name, new_topic);

        return new_topic;
    }

    get_topics(max_recent: number) {
        const all_topics = [...this.map.values()];
        all_topics.sort((t1, t2) => t2.last_msg_id - t1.last_msg_id);

        const topics = all_topics.slice(0, max_recent);

        topics.sort((t1, t2) => t1.name.localeCompare(t2.name));
        return topics;
    }
}

let ThePage: Page;

class Page {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.innerText = "loading users and recent messages...";
        div.style.marginTop = "30px";
        div.style.marginLeft = "30px";
        document.body.append(div);

        this.div = div;
    }

    populate(inner_div: HTMLElement) {
        this.div.innerHTML = "";
        this.div.append(inner_div);
    }
}

export async function get_stream_id_for_favorite_stream(): Promise<number> {
    const subscriptions = await zulip_client.get_subscriptions();

    const streams: RawStream[] = subscriptions.map((subscription: any) => {
        return {
            stream_id: subscription.stream_id,
            name: subscription.name,
        };
    });

    const stream = streams.find((stream) => {
        return stream.name === favorite_stream_name;
    });

    return stream!.stream_id;
}

function get_user_name(user_id: number): string {
    const user = UserMap.get(user_id);

    console.info(user_id);

    if (!user) {
        return "unknown user";
    }

    return user.full_name;
}

async function get_users(): Promise<void> {
    const rows = await zulip_client.get_users();

    for (const row of rows) {
        const raw_user: RawUser = {
            id: row.user_id,
            full_name: row.full_name,
        };

        console.log(row);
        UserMap.set(raw_user.id, raw_user);
    }
}

export async function run() {
    const ThePage = new Page();

    await get_users();

    const stream_id = await get_stream_id_for_favorite_stream();

    const rows = await zulip_client.get_messages_for_stream_id(stream_id, BATCH_SIZE);
    const raw_messages = rows.map((row: any) => {
        return {
            id: row.id,
            topic_name: row.subject,
            sender_id: row.sender_id,
            content: row.content,
        };
    });

    CurrentMessageStore = new MessageStore(raw_messages);

    CurrentTopicTable = new TopicTable();

    CurrentSearchWidget = new SearchWidget();
    CurrentSearchWidget.populate();

    ThePage.populate(CurrentSearchWidget.div);
}
