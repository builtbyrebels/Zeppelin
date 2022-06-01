import * as t from "io-ts";
import { BasePluginType, typedGuildCommand } from "knub";
import { GuildSocialPosts } from "src/data/GuildSocialPosts";
import { GuildLogs } from "../../data/GuildLogs";
import { tMessageContent, tNullable } from "../../utils";
import Timeout = NodeJS.Timeout;

export const PlatformPath = t.type({
  enabled: t.boolean,
  channels: t.array(t.string),
  message: tMessageContent,
  poll_interval: tNullable(t.string),
  post_poll_count: tNullable(t.number)
});
export type TPlatformPath = t.TypeOf<typeof PlatformPath>;

export const PlatformTypes = t.type({
  reddit: t.record(t.string, PlatformPath),
});

export type TPlatformTypes = t.TypeOf<typeof PlatformTypes>;

export const ConfigSchema = t.type({
  platforms: PlatformTypes,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface SocialMediaPosterPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    logs: GuildLogs;
    pollTimers: Timeout[];
    // Platform: { path: lastPost }
    sentPosts: Map<string, Map<string, BigInt>>;
    socialPosts: GuildSocialPosts;
  };
}
