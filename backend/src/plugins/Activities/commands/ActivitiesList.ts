import { activitiesCmd } from "../types";
import { activities } from "./ActivitiesCmd";

export const ActivitiesListCmd = activitiesCmd({
  trigger: ['activities', 'activity', 'activities_list'],
  permission: 'start_activities',

  async run({ message, args, pluginData}) {
    message.channel.send({
      content: `The activities available are: \`${Object.keys(activities).join(', ')}\``,
    });
  },
});
