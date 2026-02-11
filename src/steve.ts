import * as zulip_client from "./zulip_client";

function render_topic_count(count: number): HTMLElement {
    const div = document.createElement("div");
    div.innerText = `${count}`;
    div.style.padding = "3px";
    div.style.marginRight = "3px";
    div.style.width = "30px";
    div.style.textAlign = "right";

    return div;
}

function render_topic_name(topic_name: string): HTMLElement {
    const div = document.createElement("div");
    div.innerText = topic_name;
    div.style.padding = "3px";
    div.style.color = "#000080";

    return div;
}

class TopicRow {
    div: HTMLElement;

    constructor(topic: Topic) {
        const div = document.createElement("div");

        div.style.display = "flex";

        div.append(render_topic_count(topic.msg_count));
        div.append(render_topic_name(topic.name));

        this.div = div;
    }
}

class TopicList {
    div: HTMLElement;
    max_recent: number;

    constructor() {
        this.div = document.createElement("div");
        this.max_recent = 20;
        this.div.style.marginTop = "30px";
        this.div.style.marginLeft = "130px";
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

let CurrentTopicTable;

class TopicTable {
    map: Map<string, Topic>;

    constructor(messages) {
        this.map = new Map<string, number>();

        for (const message of messages) {
            const topic_name = message.subject;
            const msg_id = message.id;

            const topic = this.get_or_create(topic_name, msg_id);

            topic.update_last_message(msg_id);
        }
    }

    get_or_create(topic_name: string, msg_id: number): Topic {
        const map = this.map;
        const topic = map.get(topic_name);

        if (topic !== undefined) return topic;

        const new_topic = new Topic(topic_name, msg_id);
        map.set(topic_name, new_topic);

        return new_topic;
    }

    get_topics(max_recent: number) {
        const all_topics = [...this.map.values()];
        all_topics.sort((t1, t2) => t2.last_msg_id - t1.last_msg_id);
        console.log(all_topics.map((t) => t.name));

        const topics = all_topics.slice(0, max_recent);

        topics.sort((t1, t2) => t1.name.localeCompare(t2.name));
        return topics;
    }
}

class Page {
    div: HTMLElement;

    constructor() {
        this.div = document.createElement("div");
        this.div.innerText = "loading...";
        document.body.append(this.div);
    }

    populate(inner_div: HTMLElement) {
        this.div.innerHTML = "";
        this.div.append(inner_div);
    }
}

export async function get_stream_id_for_favorite_stream(): number {
    const subscriptions = await zulip_client.get_subscriptions();

    const streams = subscriptions.map((subscription) => {
        return {
            stream_id: subscription.stream_id,
            name: subscription.name,
        };
    });

    const stream = streams.find((stream) => {
        return stream.name === "LynRummy (engineering)";
    });

    return stream.stream_id;
}
export async function run() {
    console.log("begin steve client");

    const page = new Page();

    const stream_id = await get_stream_id_for_favorite_stream();

    const messages = await zulip_client.get_messages_for_stream_id(stream_id);

    CurrentTopicTable = new TopicTable(messages);

    const topic_list = new TopicList();
    topic_list.populate();

    page.populate(topic_list.div);
}
