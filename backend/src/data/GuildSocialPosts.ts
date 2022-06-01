import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { SocialPosts } from "./entities/SocialPosts";

export class GuildSocialPosts extends BaseGuildRepository {
  socialPosts: Repository<SocialPosts>;

  constructor(guildId) {
    super(guildId);
    this.socialPosts = getRepository(SocialPosts);
  }

  async getLastPost(platform: string, path: string) {
    const post = await this.socialPosts.findOne({
      guild_id: this.guildId,
      platform,
      path
    });
    return BigInt(post?.last_post ?? 0);
  }

  async setLastPost(platform: string, path: string, lastPost: string) {
    if (await this.getLastPost(platform, path) == BigInt(0))
      return await this.addLastPost(platform, path, lastPost);
    await this.socialPosts.update({
      guild_id: this.guildId,
      platform,
      path
    }, {
      last_post: lastPost
    });
  }

  async addLastPost(platform: string, path: string, lastPost: string) {
    await this.socialPosts.insert({
      guild_id: this.guildId,
      platform,
      path,
      last_post: lastPost
    });
  }
}
