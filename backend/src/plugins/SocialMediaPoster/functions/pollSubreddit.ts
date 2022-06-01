import fetch from "node-fetch";
import { GuildPluginData } from "knub";
import { SocialMediaPosterPluginType } from "../types";
import { LogsPlugin } from "src/plugins/Logs/LogsPlugin";
import { convertDelayStringToMS, renderRecursively, validateAndParseMessageContent } from "src/utils";
import { renderTemplate, TemplateSafeValueContainer } from "src/templateFormatter";
import { userToTemplateSafeUser } from "src/utils/templateSafeObjects";
import { MessageOptions, Snowflake, TextChannel } from "discord.js";
import { messageIsEmpty } from "src/utils/messageIsEmpty";

const REDDIT_URL = 'http://www.reddit.com';
const REDDIT_ICON = 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png'
const REDDIT_SPOILER_IMG = 'https://cdn.discordapp.com/attachments/980238012384444446/981535288289525830/SpoilerImg.jpg'
export const DEFAULT_POST_POLL_COUNT = 10;

type TRedditPost = {
  title: string,
  thumbnail: string,
  created: number,
  author: string,
  permalink: string,
  url: string,
  id: string
};

export async function pollSubreddit(
  pluginData: GuildPluginData<SocialMediaPosterPluginType>,
  subredditName: string,
) {
  const config = pluginData.config.get();
  const subreddit = config.platforms.reddit![subredditName];
  if (!subreddit) return;
  if (!subreddit.enabled) return;
  if (subreddit.channels.length == 0) return;
  const limit = subreddit.post_poll_count ?? DEFAULT_POST_POLL_COUNT;
  let redditJson;
  try {
    const redditResponse = await fetch(getRedditUrl(subredditName, limit));
    if (!redditResponse) return;
    redditJson = await redditResponse.json();
    if (!redditJson) return;
  } catch (err) {
    subreddit.enabled = false;
    const logs = pluginData.getPlugin(LogsPlugin);
    logs.logBotAlert({
      body: `Unable to poll from r/**${subredditName}**.\nPolling will be disabled for this subreddit until a config change is made.`,
    });
    return;
  }

  const previousPost = pluginData.state.sentPosts.get('reddit')!.get(subredditName)!;

  let posts: TRedditPost[] = redditJson.data.children.map((child) => child.data as TRedditPost);
  posts = posts.filter((post) => {
    return (BigInt(post.created) > previousPost);
  });
  if (posts.length === 0) return;

  posts = posts.sort((a,b) => a.created - b.created);

  pluginData.state.sentPosts.get('reddit')!.set(subredditName, BigInt(posts[posts.length - 1].created));
  await pluginData.state.socialPosts.setLastPost('reddit', subredditName, posts[posts.length - 1].created.toString());

  for (const post of posts) {
    const renderReplyText = async (str: string) =>
      {
        let thumbnail = post.thumbnail;
        if (!thumbnail.startsWith('http')) thumbnail = REDDIT_SPOILER_IMG;
        return renderTemplate(
          str,
          new TemplateSafeValueContainer({
            title: post.title,
            thumbnail,
            created: post.created,
            author: post.author,
            permalink: REDDIT_URL + post.permalink,
            url: post.url,
            id: post.id,
            reddit_icon: REDDIT_ICON
        }),
        );
      }

    const formatted =
      typeof subreddit.message === "string"
        ? await renderReplyText(subreddit.message)
        : ((await renderRecursively(subreddit.message, renderReplyText)) as MessageOptions);

    if (!formatted) continue;

    const messageContent = validateAndParseMessageContent(formatted);
    const messageOpts: MessageOptions = {
      ...messageContent,
    };

    if (messageIsEmpty(messageOpts)) continue;

    for (const channelId of subreddit.channels) {
      const channel = pluginData.guild.channels.cache.get(channelId as Snowflake);
      if (!channel) continue;
      if (!channel.isText) continue;
      const txtChannel = channel as TextChannel;
      await txtChannel.send(messageOpts);
    }
  }
}

function getRedditUrl(subreddit, limit) {
  return `${REDDIT_URL}/r/${subreddit}/new.json?limit=${limit}`
}
