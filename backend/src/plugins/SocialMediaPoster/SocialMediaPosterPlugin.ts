import { GuildPluginData, PluginOptions } from "knub";
import { GuildLogs } from "../../data/GuildLogs";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { ConfigSchema, SocialMediaPosterPluginType, TPlatformPath } from "./types";
import { LogsPlugin } from "../Logs/LogsPlugin";
import { convertDelayStringToMS } from "src/utils";
import { pollSubreddit } from "./functions/pollSubreddit";
import { GuildSocialPosts } from "src/data/GuildSocialPosts";

import { pluginInfo } from "./info";

const defaultOptions: PluginOptions<SocialMediaPosterPluginType> = {
  config: {
    platforms: {
      reddit: {}
    },
  },
};

const platforms = {
  reddit: pollSubreddit
}

export const SocialMediaPosterPlugin = zeppelinGuildPlugin<SocialMediaPosterPluginType>()({
  name: "social_media_poster",
  showInDocs: true,

  info: pluginInfo,

  configSchema: ConfigSchema,
  dependencies: () => [LogsPlugin],
  defaultOptions,

  beforeLoad(pluginData) {
    const { state, guild } = pluginData;

    state.logs = new GuildLogs(guild.id);
    state.sentPosts = new Map();
    state.socialPosts = new GuildSocialPosts(guild.id);
  },

  async afterLoad(pluginData) {
    const config = pluginData.config.get();

    // Start poll timers
    pluginData.state.pollTimers = [];
    for (const platform of Object.keys(config.platforms)) {
      if (!Object.keys(platforms).includes(platform)) continue;
      if (Object.values(config.platforms[platform]).length == 0) continue;
      pluginData.state.sentPosts.set(platform, new Map());
      for (const [path, pathSettings] of Object.entries(config.platforms[platform])) {
        await this.addPathTimer(pluginData, 'reddit', path, pathSettings as TPlatformPath);
      }
    }
  },

  async addPathTimer(pluginData: GuildPluginData<SocialMediaPosterPluginType>, platform: string, path: string, pathSettings: TPlatformPath) {
    const pathLastPost = await pluginData.state.socialPosts.getLastPost(platform, path);
    pluginData.state.sentPosts.get(platform)!.set(path, pathLastPost);

    const poll = pathSettings.poll_interval ?? '60s';
    const pollPeriodMs = convertDelayStringToMS(poll)!;
    pluginData.state.pollTimers.push(
      setInterval(() => {
        platforms[platform](pluginData, path);
      }, pollPeriodMs),
    );
  },

  beforeUnload(pluginData) {
    if (pluginData.state.pollTimers) {
      for (const interval of pluginData.state.pollTimers) {
        clearInterval(interval);
      }
    }
  }
});
