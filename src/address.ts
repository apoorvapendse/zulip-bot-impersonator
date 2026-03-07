import { DB } from "./backend/database";

export enum AddressType {
    NADA,
    CHANNEL,
    TOPIC,
    MESSAGE,
}

// We should eventually make this a discriminated union.
export type Address = {
    channel_id: number | undefined;
    topic_id: number | undefined;
    message_id: number | undefined;
};

export type PathInfo = {
    channel_id: number | undefined;
    topic_name: string | undefined;
    message_id: number | undefined;
};

export function nada(): Address {
    return {
        channel_id: undefined,
        topic_id: undefined,
        message_id: undefined,
    };
}

export function address_type(address: Address): AddressType {
    if (address.message_id) return AddressType.MESSAGE;
    if (address.topic_id) return AddressType.TOPIC;
    if (address.channel_id) return AddressType.CHANNEL;
    return AddressType.NADA;
}

function unescape(str: string) {
    return decodeURIComponent(str.replace(/\./g, "%"));
}

export function parse_path(path: string): PathInfo | undefined {
    if (path.startsWith("/")) {
        path = path.slice(1);
    }

    if (!path.startsWith("#narrow/channel")) {
        return undefined;
    }

    const [channel_part, _topic, topic_part, with_near, message_part] = path
        .split("/")
        .slice(2);

    const channel_id_str = channel_part.split("-")[0]!;
    const channel_id = parseInt(channel_id_str);
    const topic_name =
        topic_part !== undefined ? unescape(topic_part) : undefined;

    const message_id =
        message_part && with_near === "near"
            ? parseInt(message_part)
            : undefined;

    return { channel_id, topic_name, message_id };
}

function topic_id_lookup(channel_id: number, topic_name: string): number {
    return DB.topic_map.get_topic_id(channel_id, topic_name);
}

export function get_address_from_path(path: string): Address | undefined {
    if (path.startsWith("/")) {
        path = path.slice(1);
    }

    if (!path.startsWith("#narrow/channel")) {
        return undefined;
    }

    const path_info = parse_path(path);

    if (path_info === undefined) {
        return undefined;
    }

    const channel_id = path_info.channel_id;
    const topic_name = path_info.topic_name;
    const topic_id =
        channel_id && topic_name
            ? topic_id_lookup(channel_id, topic_name)
            : undefined;

    return {
        channel_id,
        topic_id,
        message_id: path_info.message_id,
    };
}
