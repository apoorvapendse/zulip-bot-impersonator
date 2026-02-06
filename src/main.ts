import { bot_phrases } from "./phrases";
import { admin_bots, AdminBot } from "./secrets";
import * as ui from "./ui";

let current_bot: AdminBot = admin_bots[0];
export function get_current_bot_name(): string {
  return current_bot.name;
}

export function set_current_bot(bot: AdminBot) {
  current_bot = bot;
}

export async function send_bot_message(msg_content?: string) {
  const body = new URLSearchParams({
    type: "stream",
    to: "zulip-bot-impersonator",
    topic: "bot testing",
    content: `${msg_content ?? bot_phrases[Math.floor(Math.random() * bot_phrases.length)]}\
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

function gui() {
  ui.render_everything();
}

gui();
