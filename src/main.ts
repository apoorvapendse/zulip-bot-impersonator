import { EventHandler, ZulipEvent } from "./backend/event";
import * as database from "./backend/database";
import * as zulip_client from "./backend/zulip_client";
import * as login_manager from "./login_manager";
import * as config from "./config";

import * as mouse_drag from "./util/mouse_drag";

import * as app from "./app";
import { Page } from "./page";

import * as game from "./lyn_rummy/game";

export async function run() {
    console.log(window.location.pathname);
    if (window.location.pathname === "/LynRummy") {
        game.gui();
        return;
    }

    if (login_manager.needs_to_login()) {
        // The login_manager will end up doing a page redirect that will
        // call this `run` again.
        return;
    }

    // We overwrite this as soon as we fetch data
    // and call page.start(), which in turn calls
    // into SearchWidget to get the unread counts
    // for our initial download of Zulip data.  But
    // this is nice to have while data is still loading.
    document.title = config.get_current_realm_nickname()!;

    mouse_drag.initialize();

    // do before fetching to get "spinner"
    const page = new Page();

    function handle_event(event: ZulipEvent) {
        // We want the model to update before any plugins touch
        // the event.
        database.handle_event(event);

        // The Page object dispatches events to all the plugins.
        page.handle_event(event);
    }

    const event_manager = new EventHandler(handle_event);

    // we wait for register to finish, but then polling goes
    // on "forever" asynchronously
    await zulip_client.register_queue();

    await database.fetch_original_data();

    zulip_client.start_polling(event_manager);

    page.start();

    app.init(page);
}

run();
