import { activitiesCmd } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage } from "src/pluginUtils";

import { RESTPostAPIChannelInviteJSONBody, APIInvite, InviteTargetType, RouteBases, Routes } from 'discord-api-types/v9';
import fetch from "node-fetch";

export const activities = {
  poker: '755827207812677713',
  betrayal: '773336526917861400',
  youtube: '880218394199220334',
  fishington: '814288819477020702',
  chess: '832012774040141894',
  checkers: '832013003968348200',
  letter: '879863686565621790',
  word: '879863976006127627',
  sketchheads: '902271654783242291',
  spellcast: '852509694341283871',
  ocho: '832025144389533716',
}

export const ActivitiesCmd = activitiesCmd({
  trigger: ['activities', 'activity'],
  permission: 'start_activities',

  signature: {
    activity: ct.string(),
    channel: ct.voiceChannel(),
  },

  async run({ message, args, pluginData}) {
    if (!Object.keys(activities).includes(args.activity.toLowerCase())) {
      sendErrorMessage(pluginData, message.channel, `Unknown activity \`${args.activity}\`.\nUse one from this list: \`${Object.keys(activities).join(', ')}\``);
      return;
    }

    const channel = args.channel;
    if (!channel) {
      sendErrorMessage(pluginData, message.channel, `Unknown channel: ${args.channel}`);
      return;
    }

    if (!channel.isVoice) {
      sendErrorMessage(pluginData, message.channel, `Supplied channel is not a voice channel`);
      return;
    }

    const r = await fetch(`${RouteBases.api}${Routes.channelInvites(channel.id)}`, {
      method: 'POST',
      headers: {
        authorization: `Bot ${process.env.TOKEN}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        max_age: 0,
        target_type: InviteTargetType.EmbeddedApplication,
        target_application_id: activities[args.activity.toLowerCase()],
      } as RESTPostAPIChannelInviteJSONBody)
    });

    const invite = await r.json() as APIInvite;

    if (r.status !== 200) {
      sendErrorMessage(pluginData, message.channel, `An error occurred: ${(invite as any).message}\nUnable to create an activities invite!\nMake sure I have the "Create Invite" permission in ${channel}.`);
      return;
    }

    message.channel.send({
      content: `Click here to join ${args.activity} in ${channel}: https://discord.gg/${invite.code}`,
    });
  },
});
