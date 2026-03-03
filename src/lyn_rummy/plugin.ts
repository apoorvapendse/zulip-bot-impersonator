import * as lyn_rummy from "./game";

import type { ZulipEvent } from "../backend/event";
import type { PluginHelper } from "../plugin_helper";

export function plugin(plugin_helper: PluginHelper) {
    const div = document.createElement("div");

    const deck_cards = lyn_rummy.build_full_double_deck();
    lyn_rummy.run_game_code(deck_cards, div);

    const max_height = document.documentElement.clientHeight - 60;
    div.style.maxHeight = `${max_height}px`;

    plugin_helper.update_label(lyn_rummy.get_title());

    function handle_event(_event: ZulipEvent) {}

    return {
        div,
        handle_event,
    };
}
