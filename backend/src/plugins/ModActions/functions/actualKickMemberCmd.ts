import { GuildMember, Message, TextChannel, ThreadChannel } from "discord.js";
import { GuildPluginData } from "knub";
import { hasPermission } from "knub/dist/helpers";
import { LogType } from "../../../data/LogType";
import { canActOn, sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { errorMessage, resolveMember, resolveUser } from "../../../utils";
import { IgnoredEventType, ModActionsPluginType } from "../types";
import { formatReasonWithAttachments } from "./formatReasonWithAttachments";
import { ignoreEvent } from "./ignoreEvent";
import { isBanned } from "./isBanned";
import { kickMember } from "./kickMember";
import { parseReason } from "./parseReason";
import { readContactMethodsFromArgs } from "./readContactMethodsFromArgs";

export async function actualKickMemberCmd(
  pluginData: GuildPluginData<ModActionsPluginType>,
  msg: Message,
  args: {
    user: string;
    reason: string;
    mod: GuildMember;
    notify?: string;
    "notify-channel"?: TextChannel | ThreadChannel;
    clean?: boolean;
  },
) {
  const user = await resolveUser(pluginData.client, args.user);
  const channel = msg.channel as TextChannel;
  if (!user.id || !msg.member) {
    sendErrorMessage(pluginData, channel, `User not found`);
    return;
  }

  const memberToKick = await resolveMember(pluginData.client, pluginData.guild, user.id);

  if (!memberToKick) {
    const banned = await isBanned(pluginData, user.id);
    if (banned) {
      sendErrorMessage(pluginData, channel, `User is banned`);
    } else {
      sendErrorMessage(pluginData, channel, `User not found on the server`);
    }

    return;
  }

  // Make sure we're allowed to kick this member
  if (!canActOn(pluginData, msg.member, memberToKick)) {
    sendErrorMessage(pluginData, channel, "Cannot kick: insufficient permissions");
    return;
  }

  // The moderator who did the action is the message author or, if used, the specified -mod
  let mod = msg.member;
  if (args.mod) {
    if (!(await hasPermission(await pluginData.config.getForMessage(msg), "can_act_as_other"))) {
      sendErrorMessage(pluginData, channel, "You don't have permission to use -mod");
      return;
    }

    mod = args.mod;
  }

  let contactMethods;
  try {
    contactMethods = readContactMethodsFromArgs(args);
  } catch (e) {
    sendErrorMessage(pluginData, channel, e.message);
    return;
  }

  const config = pluginData.config.get();
  const reason = formatReasonWithAttachments(parseReason(config, args.reason), [...msg.attachments.values()]);

  const kickResult = await kickMember(pluginData, memberToKick, reason, {
    contactMethods,
    caseArgs: {
      modId: mod.id,
      ppId: mod.id !== msg.author.id ? msg.author.id : undefined,
    },
  });

  if (args.clean) {
    pluginData.state.serverLogs.ignoreLog(LogType.MEMBER_BAN, memberToKick.id);
    ignoreEvent(pluginData, IgnoredEventType.Ban, memberToKick.id);

    try {
      await memberToKick.ban({ days: 1, reason: "kick -clean" });
    } catch {
      sendErrorMessage(pluginData, channel, "Failed to ban the user to clean messages (-clean)");
    }

    pluginData.state.serverLogs.ignoreLog(LogType.MEMBER_UNBAN, memberToKick.id);
    ignoreEvent(pluginData, IgnoredEventType.Unban, memberToKick.id);

    try {
      await pluginData.guild.bans.remove(memberToKick.id, "kick -clean");
    } catch {
      sendErrorMessage(pluginData, channel, "Failed to unban the user after banning them (-clean)");
    }
  }

  if (kickResult.status === "failed") {
    msg.channel.send(errorMessage(`Failed to kick user`));
    return;
  }

  // Confirm the action to the moderator
  let response = `Kicked **${memberToKick.user.tag}** (Case #${kickResult.case.case_number})`;

  if (kickResult.notifyResult.text) response += ` (${kickResult.notifyResult.text})`;
  sendSuccessMessage(pluginData, channel, response);
}
