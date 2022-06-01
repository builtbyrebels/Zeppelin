import { trimPluginDescription } from "../../utils";
import { ZeppelinGuildPluginBlueprint } from "../ZeppelinPluginBlueprint";

export const pluginInfo: ZeppelinGuildPluginBlueprint["info"] = {
  prettyName: "Social Media Auto Poster",
  description: trimPluginDescription(`
      Allows posting new social media posts automatically.
    `),
  configurationGuide: trimPluginDescription(`
      The Social Media Auto Poster plugin is very customizable. For a full list of available platforms, and their options, see Config schema at the bottom of this page.    
    
      ### Simple reddit poster
      Automatically sends reddit posts to a channel
      
      ~~~yml
      social_media_poster:
        config:
          platforms:
            reddit:
              tbhCreature: # Name of the subreddit
                enabled: true
                channels: ["473087035574321152"]
                message: |-
                  **{author}** posted **{title}** in **tbhCreature**
      ~~~
      
      ### Embed reddit poster
      This example posts the post as an embed
      
      ~~~yml
      social_media_poster:
        config:
          platforms:
            reddit:
              tbhCreature: # Name of the subreddit
                enabled: true
                channels: ["473087035574321152"]
                message:
                  embed:
                    title: "{title}"
                    color: 0xff4500
                    description: "{url}"
                    url: "{permalink}"
                    footer:
                      url: "{permalink}"
                      icon_url: "{reddit_icon}"
                      text: "{author}"
                    thumbnail:
                      url: "{thumbnail}"
      ~~~
      
      ### List of variables
      
      \`\`\`
       - {title} : Title of the post
       - {thumbnail} : Img URL for the post
       - {created} : The epoch time of when posted
       - {author} : The posts author
       - {permalink} : The posts permalink url
       - {url} : The posts URL
       - {id}: The ID of the post
       - {reddit_icon}: A 32x32 image of the reddit logo
      \`\`\`
    `),
};
