import * as zulip_client from "./zulip_client";

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
    div.style.color = "#000080";
    div.style.cursor = "pointer";

    return div;
}

function render_topic_heading(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.backgroundColor = "#000080";
    div.style.padding = "4px";
    div.style.color = "white";
    div.style.fontSize = "19px";

    return div;
}

class TopicRowName {
    div: HTMLElement;

    constructor(topic_name: string) {
        const div = document.createElement("div");
        div.append(render_topic_name(topic_name));

        div.addEventListener("click", () => {
            CurrentSearchWidget.set_topic_name(topic_name);
        });

        this.div = div;
    }
}

class TopicRow {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.style.display = "flex";

        const topic_row_name = new TopicRowName(topic.name);

        div.append(render_topic_count(topic.msg_count));
        div.append(topic_row_name.div);

        this.div = div;
    }
}

class MessagePane {
    div: HTMLElement;

    constructor() {
        const div = document.createElement("div");
        div.innerText = "(no topic selected)";

        this.div = div;
    }

    set_topic_name(topic_name: string): void {
        const div = this.div;

        div.innerHTML = "";

        div.append(render_topic_heading(topic_name));
        const messages = CurrentMessageStore.message_for_topic_name(topic_name);
        console.log(messages);
    }
}

let CurrentSearchWidget: SearchWidget;

class SearchWidget {
    div: HTMLElement;
    message_pane: MessagePane;

    constructor() {
        const div = document.createElement("div");
        div.style.display = "flex";
        this.div = div;

        this.message_pane = new MessagePane();
    }

    populate(): void {
        const div = this.div;

        div.innerHTML = "";
        const topic_list = new TopicList();
        topic_list.populate();

        div.append(topic_list.div);
        div.append(this.message_pane.div);
    }

    set_topic_name(topic_name: string): void {
        this.message_pane.set_topic_name(topic_name);
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
};

type RawStream = {
    stream_id: number;
    name: string;
};

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

class TopicList {
    div: HTMLElement;
    max_recent: number;

    constructor() {
        this.div = document.createElement("div");
        this.max_recent = 20;
    }

    populate() {
        const max_recent = this.max_recent;
        const topics = CurrentTopicTable.get_topics(max_recent);
        const div = this.div;

        div.innerHTML = "";

        for (const topic of topics) {
            const topic_row = new TopicRow(topic);
            div.append(topic_row.div);
        }
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
        div.innerText = "loading recent messages...";
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

export async function run() {
    console.log("begin steve client");

    const ThePage = new Page();

    const stream_id = await get_stream_id_for_favorite_stream();

    const rows = await zulip_client.get_messages_for_stream_id(stream_id, BATCH_SIZE);
    const raw_messages = rows.map((row: any) => {
        return {
            id: row.id,
            topic_name: row.subject,
        };
    });

    CurrentMessageStore = new MessageStore(raw_messages);

    CurrentTopicTable = new TopicTable();

    CurrentSearchWidget = new SearchWidget();
    CurrentSearchWidget.populate();

    ThePage.populate(CurrentSearchWidget.div);
}
