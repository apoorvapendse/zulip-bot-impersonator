import { realm_data, self_creds } from "./secrets";
import { add_new_message_to_message_feed } from "./ui";

function get_headers() {
  const auth = btoa(`${self_creds.email}:${self_creds.api_key}`);
  const auth_header = `Basic ${auth}`;
  return { Authorization: auth_header };
}

let queue_id: string | undefined;
let last_event_id: string | undefined;

export async function register_queue() {
  const url = realm_data.url;
  const response = await fetch(url.href + "/api/v1/register", {
    method: "POST",
    headers: get_headers(),
  });
  const data = await response.json();
  queue_id = data.queue_id;
  last_event_id = data.last_event_id;
  start_polling();
}

async function start_polling() {
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
      process_events(data.events);
    }
  }
}

function process_events(events: any) {
  for (const event of events) {
    if (event.type === "message") {
      const message = event.message;
      if (message.type === "stream") {
        const sender_name = message.sender_full_name;
        const content = message.content;
        const topic = message.subject;
        const stream = message.display_recipient;
        add_new_message_to_message_feed({
          sender_name,
          content,
          topic,
          stream,
        });
      }
    }
  }
}

export async function get_user_details_by_email(email:string){
  const url = new URL(`/api/v1/users/${email}`, realm_data.url);
  const response = await fetch(url, { headers: get_headers() });
  const data = await response.json();
  const {user} = data;
  return user;
}