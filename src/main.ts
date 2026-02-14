import { bot_phrases } from "./phrases";
import { admin_bots, ZulipAccount } from "./secrets";
import * as ui from "./ui";
import * as zulip_client from "./zulip_client";
import * as steve from "./steve";
let current_bot: ZulipAccount = admin_bots[0];
let current_topic: string = "bot testing";
let current_stream: string = "zulip-bot-impersonator";

export function get_current_bot_name(): string {
    return current_bot.name;
}

export function set_current_bot(bot: ZulipAccount) {
    current_bot = bot;
}

export function set_current_topic(topic: string) {
    current_topic = topic;
}

export function set_current_stream(stream: string) {
    current_stream = stream;
}

export function get_current_topic() {
    return current_topic;
}

export function get_current_stream() {
    return current_stream;
}

export async function send_bot_message(msg_content?: string) {
    const body = new URLSearchParams({
        type: "stream",
        to: current_stream,
        topic: current_topic,
        content: `${msg_content || bot_phrases[Math.floor(Math.random() * bot_phrases.length)]}\
      \n*This was sent from the [zulip-bot-impersonator](https://github.com/apoorvapendse/zulip-bot-impersonator)*`,
    });

    const credentials = btoa(`${current_bot.email}:${current_bot.api_key}`);
    const response = await fetch(
        "https://macandcheese.zulipchat.com/api/v1/messages",
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        },
    );

    const data = await response.json();
    console.log(data);
}

/*
function gui() {
    ui.render_client();
}

gui();
*/

steve.run();
zulip_client.register_queue();
