import type { Database } from "./database";
import type { Message } from "./db_types";

import * as parse from "./parse";
import * as zulip_client from "./zulip_client";

type ServerMessage = {
    content: string;
    flags: string[];
    id: number;
    reactions: any[];
    sender_email: string;
    sender_full_name: string;
    sender_id: number;
    stream_id: number;
    subject: string;
    timestamp: number;
    type: "stream";
};

const INITIAL_BATCH_SIZE = 2000;

export async function fetch_initial_messages(db: Database): Promise<void> {
    const rows = await zulip_client.get_messages(INITIAL_BATCH_SIZE);

    await process_message_rows_from_server(db, rows);

    console.log(`${db.message_map.size} messages fetched!`);
}

async function process_message_rows_from_server(db: Database, rows: ServerMessage[]): Promise<void> {
    const messages: Message[] = rows
        .filter((row) => row.type === "stream")
        .map((row) => {
            const local_message_id = undefined; // is only in events

            const topic = db.topic_map.get_or_make_topic_for(
                row.stream_id,
                row.subject,
            );
            const unread =
                row.flags.find((flag: string) => flag === "read") === undefined;

            const message_id = row.id;

            const message: Message = {
                code_snippets: [],
                content: row.content,
                github_refs: [],
                id: message_id,
                is_super_new: false,
                local_message_id,
                sender_id: row.sender_id,
                stream_id: row.stream_id,
                timestamp: row.timestamp,
                topic_id: topic.topic_id,
                type: row.type,
                unread,
            };

            parse.parse_content(message);
            db.reactions_map.add_server_reactions(row.reactions, message_id);

            return message;
        });

    for (const row of rows) {
        if (!db.user_map.has(row.sender_id)) {
            const id = row.sender_id;
            const email = row.sender_email;
            const full_name = row.sender_full_name;
            const user = { id, email, full_name };
            db.user_map.set(id, user);
        }
    }

    for (const message of messages) {
        db.message_index.add_message(message);
        db.message_map.set(message.id, message);
    }
}
