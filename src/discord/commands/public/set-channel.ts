import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";
import { channelCollection } from "#collections";
import { log } from "#settings"
import ck from "chalk"

new Command({
	name: "set-channel",
	description: "set channel to send events",
	type: ApplicationCommandType.ChatInput,
	run: async (interaction) => {
        const {channelId, user} = interaction

        if(channelCollection.has(process.env.CHANNEL_KEY)) {
            channelCollection.delete(process.env.CHANNEL_KEY)
        }

        channelCollection.set(process.env.CHANNEL_KEY, {id: channelId, userId: user.id, username: user.username, userAvatar: user.avatarURL()})

        interaction.reply({ content: "Canal seleconado com sucesso!", ephemeral: true });
        return log.success(ck.green(`Canal ${channelId} selecionado com sucesso!`))
	},
})
