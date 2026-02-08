export type ZulipAccount = {
  email: string;
  api_key: string;
  name: string;
};

export type RealmData = {
  url: URL;
};

export const realm_data: RealmData = {
  url: new URL("<your-realm-url>"),
};

export const admin_bots: ZulipAccount[] = [
  // Add your bot details here.
  {
    email: "",
    name: "",
    api_key: "",
  },
  {
    email: "",
    name: "",
    api_key: "",
  },
];

// Queue will be registered and events will be polled
// on behalf on this account.
// It is YOUR responsibility to ensure your bots have the right
// permissions to send messages to the target stream>topic in the realm.
export const self_creds: ZulipAccount = {
  name: "Your display name in the zulip-bot-impersonator client",
  email: "",
  api_key: "",
};
