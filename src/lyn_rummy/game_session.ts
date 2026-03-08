import type { JsonGameEvent } from "./game";

import * as network from "./network";

export class GameSession {
    game_id: number;
    channel_id: number;

    constructor(info: { game_id: number; channel_id: number }) {
        const { game_id, channel_id } = info;
        this.game_id = game_id;
        this.channel_id = channel_id;
    }

    broadcast(json_game_event: JsonGameEvent) {
        const game_id = this.game_id;
        const channel_id = this.channel_id;
        network.serialize({
            channel_id,
            category: "game_events",
            key: game_id.toString(),
            content_label: "lynrummy-event",
            value: json_game_event,
            message_callback: (_message) => {},
        });
    }

    get_events(): JsonGameEvent[] {
        return network.deserialize_game_events(this.game_id);
    }
}
