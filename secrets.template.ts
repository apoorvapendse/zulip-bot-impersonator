/*
    Configure this carefully!

    The Event Queue will be registered and events will be polled
    on behalf of the user_creds account.

    Also, it is YOUR responsibility to ensure your bots have the right
    permissions to send messages to the target stream>topic in the realm.
*/

// SKIP PAST THE BOILERPLATE:

export type ZulipAccount = {
    email: string;
    api_key: string;
    name: string;
};

export type RealmData = {
    url: URL;
};

export type Config = {
    nickname: string;
    realm_url: string;
    admin_bots: ZulipAccount[];
    user_creds: ZulipAccount;
};

/****************** MAKE CHANGES BELOW!!! ************************/

const mac_config = {
    nickname: "Le Big Mac",
    realm_url: "https://macandcheese.zulipchat.com",
    admin_bots: [],
    user_creds: {
        name: "Steve Howell",
        email: "steve@example.com",
        api_key: "KjGFREDuCNLFREDbXl7FREDYsbRdDORP",
    },
};

export const config = mac_config;

/*****************************************************************/

// BOILERPLATE FOLLOWS:

export const realm_data: RealmData = {
    url: new URL(config.realm_url),
};

export const admin_bots = config.admin_bots;

export const self_creds = config.user_creds;
