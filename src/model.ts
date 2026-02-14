import * as zulip_client from "./zulip_client";

const BATCH_SIZE = 5000;

export type RawMessage = {
    id: number;
    sender_id: number;
    stream_id: number;
    topic_name: string;
    content: string;
};

export type StreamInfo = {
    num_messages: number;
    stream: Stream;
};

export type Stream = {
    stream_id: number;
    name: string;
};

type RawUser = {
    id: number;
    full_name: string;
    avatar_url: string;
};

export let UserMap = new Map<number, RawUser>();

let RawMessages: RawMessage[];
export let Streams: Stream[];

let CurrentMessageStore: MessageStore;

class MessageStore {
    raw_messages: RawMessage[];

    constructor(raw_messages: RawMessage[]) {
        console.log("building message store");
        this.raw_messages = raw_messages;
    }

    messages_for_topic_name(stream_id: number, topic_name: string) {
        return this.raw_messages.filter((raw_message) => {
            return (
                raw_message.stream_id === stream_id &&
                raw_message.topic_name === topic_name
            );
        });
    }

    messages_for_stream(stream_id: number): RawMessage[] {
        return this.raw_messages.filter((raw_message) => {
            return raw_message.stream_id === stream_id;
        });
    }

    num_messages_for_stream_id(stream_id: number): number {
        return this.messages_for_stream(stream_id).length;
    }

    add_messages(messages:RawMessage[]){
        this.raw_messages.push(...messages)
    }
}

export function get_streams(): StreamInfo[] {
    return Streams.map((stream) => {
        return {
            num_messages: num_messages_for_stream(stream),
            stream,
        };
    });
}

export class Topic {
    stream_id: number;
    name: string;
    last_msg_id: number;
    msg_count: number;

    constructor(stream_id: number, name: string) {
        this.stream_id = stream_id;
        this.name = name;
        this.msg_count = 0;
        this.last_msg_id = -1;
    }

    update_last_message(msg_id: number): void {
        if (msg_id > this.last_msg_id) {
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
            const stream_id = message.stream_id;
            const topic_name = message.topic_name;
            const msg_id = message.id;

            const topic = this.get_or_create(stream_id, topic_name);

            topic.update_last_message(msg_id);
        }
    }

    get_or_create(stream_id: number, topic_name: string): Topic {
        const map = this.map;
        const topic_key = `${stream_id},${topic_name}`;
        const topic = map.get(topic_key);

        if (topic !== undefined) return topic;

        const new_topic = new Topic(stream_id, topic_name);
        map.set(topic_key, new_topic);

        return new_topic;
    }

    get_topics(stream_id: number) {
        const all_topics = [...this.map.values()];

        return all_topics.filter((topic) => topic.stream_id === stream_id);
    }
}

export function get_recent_topics(stream_id: number): Topic[] {
    return CurrentTopicTable.get_topics(stream_id);
}

export function messages_for_topic(topic: Topic): RawMessage[] {
    return CurrentMessageStore.messages_for_topic_name(
        topic.stream_id,
        topic.name,
    );
}

export function add_messages_to_cache(message: RawMessage) {
  CurrentMessageStore.add_messages([message])
}

async function fetch_streams(): Promise<Stream[]> {
    const subscriptions = await zulip_client.get_subscriptions();

    const streams: Stream[] = subscriptions.map((subscription: any) => {
        return {
            stream_id: subscription.stream_id,
            name: subscription.name,
        };
    });

    return streams;
}

export function stream_name_for(stream_id: number): string {
    const stream = Streams.find((stream) => {
        return stream.stream_id === stream_id;
    });

    return stream!.name;
}

async function get_users(): Promise<void> {
    const rows = await zulip_client.get_users();

    for (const row of rows) {
        const raw_user: RawUser = {
            id: row.user_id,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
        };

        UserMap.set(raw_user.id, raw_user);
    }
}

async function get_raw_messages(): Promise<RawMessage[]> {
    const rows = await zulip_client.get_messages(BATCH_SIZE);
    return rows.map((row: any) => {
        return {
            id: row.id,
            sender_id: row.sender_id,
            topic_name: row.subject,
            stream_id: row.stream_id,
            content: row.content,
        };
    });
}

function num_messages_for_stream(stream: Stream): number {
    return CurrentMessageStore.num_messages_for_stream_id(stream.stream_id);
}

export async function fetch_model_data(): Promise<void> {
    await get_users();
    Streams = await fetch_streams();

    const raw_messages = await get_raw_messages();

    CurrentMessageStore = new MessageStore(raw_messages);
    console.log("we have messages");

    CurrentTopicTable = new TopicTable();
    console.log("we have a model");
}
