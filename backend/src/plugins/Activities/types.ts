import * as t from "io-ts";
import { BasePluginType, typedGuildCommand } from "knub";

export const ConfigSchema = t.type({
  start_activities: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface ActivitiesPluginType extends BasePluginType {
  config: TConfigSchema;
  state: {};
}

export const activitiesCmd = typedGuildCommand<ActivitiesPluginType>();
