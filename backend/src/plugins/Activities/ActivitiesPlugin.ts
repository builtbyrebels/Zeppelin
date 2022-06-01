import { PluginOptions } from "knub";
import { zeppelinGuildPlugin } from "../ZeppelinPluginBlueprint";
import { ActivitiesCmd } from "./commands/ActivitiesCmd";
import { ActivitiesListCmd } from "./commands/ActivitiesList";
import { ActivitiesPluginType, ConfigSchema } from "./types";

const defaultOptions: PluginOptions<ActivitiesPluginType> = {
  config: {
    start_activities: false
  },
  overrides: [
    {
      level: ">=50",
      config: {
        start_activities: true
      }
    }
  ]
};

export const ActivitiesPlugin = zeppelinGuildPlugin<ActivitiesPluginType>()({
  name: "activities",
  showInDocs: true,

  commands: [
    ActivitiesCmd,
    ActivitiesListCmd
  ],

  configSchema: ConfigSchema,
  defaultOptions,
});
