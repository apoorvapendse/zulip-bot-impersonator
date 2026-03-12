import type { Database } from "./database";
import type { Message, Reaction } from "./db_types";

import * as parse from "./parse";
import * as zulip_client from "./zulip_client";

const INITIAL_BATCH_SIZE = 2000;

export function convert_server_reactions(
    reactions: any[],
    message_id: number,
): Reaction[] {
    const raw_reactions = reactions.filter(
        (reaction: any) => reaction.reaction_type === "unicode_emoji",
    );
    // Maps emoji name to a Reaction object.
    const reaction_map = new Map<string, Reaction>();

    for (const raw_reaction of raw_reactions) {
        if (!reaction_map.has(raw_reaction.emoji_name)) {
            const reaction: Reaction = {
                emoji_code: raw_reaction.emoji_code,
                emoji_name: raw_reaction.emoji_name,
                user_ids: new Set<number>([raw_reaction.user_id]),
                message_id: message_id,
            };
            reaction_map.set(raw_reaction.emoji_name, reaction);
        } else {
            reaction_map
                .get(raw_reaction.emoji_name)!
                .user_ids.add(raw_reaction.user_id);
        }
    }
    return [...reaction_map.values()];
}

export async function fetch_initial_messages(db: Database): Promise<void> {
    const { message_map, topic_map, user_map, message_index } = db;

    const rows = await zulip_client.get_messages(INITIAL_BATCH_SIZE);

    const messages: Message[] = rows
        .filter((row: any) => row.type === "stream")
        .map((row: any) => {
            const local_message_id = undefined; // is only in events

            const topic = topic_map.get_or_make_topic_for(
                row.stream_id,
                row.subject,
            );
            const unread =
                row.flags.find((flag: string) => flag === "read") === undefined;

            const reactions = convert_server_reactions(row.reactions, row.id);

            const message: Message = {
                code_snippets: [],
                content: row.content,
                github_refs: [],
                id: row.id,
                is_super_new: false,
                local_message_id,
                sender_id: row.sender_id,
                stream_id: row.stream_id,
                timestamp: row.timestamp,
                topic_id: topic.topic_id,
                type: row.type,
                reactions,
                unread,
            };
            parse.parse_content(message);
            return message;
        });

    for (const row of rows) {
        if (!user_map.has(row.sender_id)) {
            const id = row.sender_id;
            const email = row.sender_email;
            const full_name = row.sender_full_name;
            const user = { id, email, full_name };
            user_map.set(id, user);
        }
    }

    for (const message of messages) {
        message_index.add_message(message);
        message_map.set(message.id, message);
    }

    console.log(`${message_map.size} messages fetched!`);
}
