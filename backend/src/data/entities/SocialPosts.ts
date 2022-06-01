import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("social_posts")
export class SocialPosts {
  @Column()
  @PrimaryColumn()
  guild_id: string;

  @Column()
  platform: string;

  @Column()
  path: string;

  @Column() last_post: string;

  // Guild, reddit, subreddit, last_post (ms)
}
