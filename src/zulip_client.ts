import type { EventHandler } from "./event";
import { realm_data, self_creds } from "./secrets";
import { Popup } from "./steve";

function get_headers() {
    const auth = btoa(`${self_creds.email}:${self_creds.api_key}`);
    const auth_header = `Basic ${auth}`;
    return { Authorization: auth_header };
}

let queue_id: string | undefined;
let last_event_id: string | undefined;

export async function register_queue() {
    const url = new URL("/api/v1/register", realm_data.url);
    url.searchParams.set("apply_markdown", "true");

    const response = await fetch(url, {
        method: "POST",
        headers: get_headers(),
    });
    const data = await response.json();
    queue_id = data.queue_id;
    last_event_id = data.last_event_id;
}

export async function start_polling(event_handler: EventHandler) {
    if (queue_id === undefined || last_event_id === undefined) {
        return;
    }

    const url = new URL("/api/v1/events", realm_data.url);

    while (queue_id !== undefined && last_event_id !== undefined) {
        url.searchParams.set("queue_id", queue_id);
        url.searchParams.set("last_event_id", last_event_id);

        const response = await fetch(url, { headers: get_headers() });
        const data = await response.json();

        if (data.result !== "success") {
            window.location.reload();
        }
        if (data.events?.length) {
            last_event_id = data.events[data.events.length - 1].id;
            event_handler.process_events(data.events);
        }
    }
}

export async function get_stream_messages(num_before: number) {
    const url = new URL(`/api/v1/messages`, realm_data.url);
    url.searchParams.set("narrow", `[{"operator": "is", "operand": "dm", "negated": true}]`);
    url.searchParams.set("num_before", JSON.stringify(num_before));
    url.searchParams.set("anchor", "newest");
    const response = await fetch(url, { headers: get_headers() });
    const data = await response.json();
    console.log("found oldest", data.found_oldest);
    return data.messages;
}

export async function get_users() {
    const url = new URL(`/api/v1/users`, realm_data.url);
    const response = await fetch(url, { headers: get_headers() });
    const data = await response.json();
    return data.members;
}

export async function get_subscriptions() {
    const url = new URL(`/api/v1/users/me/subscriptions`, realm_data.url);
    const response = await fetch(url, { headers: get_headers() });
    const data = await response.json();
    return data.subscriptions;
}
