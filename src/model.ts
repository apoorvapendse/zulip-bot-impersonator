import type { RawUser, Stream, StreamInfo, RawMessage, RawStreamMessage } from "./db_types.ts";
import { Topic } from "./db_types";

import * as zulip_client from "./zulip_client";

const BATCH_SIZE = 5000;

export let UserMap = new Map<number, RawUser>();

let RawStreamMessages: RawStreamMessage[];
export let Streams: Stream[];

let CurrentMessageStore: MessageStore;

class MessageStore {
    raw_stream_messages: RawStreamMessage[];

    constructor(raw_stream_messages: RawStreamMessage[]) {
        console.log("building message store");
        this.raw_stream_messages = raw_stream_messages;
    }

    messages_for_topic_name(stream_id: number, topic_name: string) {
        return this.raw_stream_messages.filter((raw_stream_message) => {
            return (
                raw_stream_message.stream_id === stream_id &&
                raw_stream_message.topic_name === topic_name
            );
        });
    }

    messages_for_stream(stream_id: number): RawStreamMessage[] {
        return this.raw_stream_messages.filter((raw_stream_message) => {
            return raw_stream_message.stream_id === stream_id;
        });
    }

    num_messages_for_stream_id(stream_id: number): number {
        return this.messages_for_stream(stream_id).length;
    }

    add_messages(messages: RawStreamMessage[]) {
        this.raw_stream_messages.push(...messages);
    }
}

export function participants_for_stream(stream_id: number): RawUser[] {
    const map = new Map<number, number>();

    const messages = CurrentMessageStore.messages_for_stream(stream_id);

    for (const message of messages) {
        const sender_id = message.sender_id;
        const count = (map.get(sender_id) ?? 0) + 1;
        map.set(sender_id, count);
    }

    const sender_ids = [...map.keys()];

    sender_ids.sort((s1, s2) => map.get(s2)! - map.get(s1)!);

    // we still need system bots
    return sender_ids
        .map((sender_id) => UserMap.get(sender_id)!)
        .filter((user) => user !== undefined);
}

export function get_streams(): StreamInfo[] {
    return Streams.map((stream) => {
        return {
            num_messages: num_messages_for_stream(stream),
            stream,
        };
    });
}

let CurrentTopicStore: TopicStore;

class TopicStore {
    map: Map<string, Topic>;

    constructor() {
        this.map = new Map<string, Topic>();

        for (const message of CurrentMessageStore.raw_stream_messages) {
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

export function get_topics(stream_id: number): Topic[] {
    return CurrentTopicStore.get_topics(stream_id);
}

export function messages_for_topic(topic: Topic): RawMessage[] {
    return CurrentMessageStore.messages_for_topic_name(
        topic.stream_id,
        topic.name,
    );
}

export function add_stream_messages_to_cache(message: RawStreamMessage) {
    CurrentMessageStore.add_messages([message]);
    CurrentTopicStore = new TopicStore();
}

async function fetch_streams(): Promise<Stream[]> {
    const subscriptions = await zulip_client.get_subscriptions();

    const streams: Stream[] = subscriptions.map((subscription: any) => {
        return {
            stream_id: subscription.stream_id,
            rendered_description: subscription.rendered_description,
            stream_weekly_traffic: subscription.stream_weekly_traffic,
            name: subscription.name,
        };
    });

    return streams;
}

export function stream_for(stream_id: number): Stream {
    const stream = Streams.find((stream) => {
        return stream.stream_id === stream_id;
    });

    return stream!;
}

export function stream_name_for(stream_id: number): string {
    return stream_for(stream_id).name;
}

async function fetch_users(): Promise<RawUser[]> {
    const rows: any[] = await zulip_client.get_users();

    return rows.map((row) => {
        return {
            id: row.user_id,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
        };
    });
}

async function fetch_raw_stream_messages(): Promise<RawStreamMessage[]> {
    const rows = await zulip_client.get_messages(BATCH_SIZE);
    return rows
        .filter((row: any) => row.type === "stream")
        .map((row: any) => {
            return {
                id: row.id,
                type: row.type,
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
    console.log("starting fetch");
    const users = await fetch_users();

    for (const user of users) {
        UserMap.set(user.id, user);
    }

    console.log("got users");

    Streams = await fetch_streams();
    console.log("got streams");

    const raw_stream_messages = await fetch_raw_stream_messages();
    console.log("got messages");

    CurrentMessageStore = new MessageStore(raw_stream_messages);
    console.log("we have messages");

    CurrentTopicStore = new TopicStore();
    console.log("we have a model");
}
