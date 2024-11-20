import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";
import { channel } from "discord/collections/channel.js";

new Command({
	name: "set-channel",
	description: "set channel to send events",
	type: ApplicationCommandType.ChatInput,
	run: async (interaction) => {
        const {channelId} = interaction

        if(channel.has(process.env.CHANNEL_KEY)) {
            channel.delete(process.env.CHANNEL_KEY)
        }

        channel.set(process.env.CHANNEL_KEY, {id: channelId})

        return interaction.reply({ content: "Canal seleconado com sucesso!", ephemeral: true });
	},
})
