import { Command } from "#base";
import { ApplicationCommandType } from "discord.js";
import { googleCalendar } from "#base";
import { log } from "#settings";
import ck from "chalk";

new Command({
	name: "setup-google-calendar",
	description: "Configurar integração com Google Agenda",
	type: ApplicationCommandType.ChatInput,
	run: async (interaction) => {
		try {
			const authUrl = googleCalendar.generateAuthUrl();
			
			await interaction.reply({
				content: `🔗 **Configuração do Google Agenda**\n\n` +
					`Clique no link abaixo para autorizar o acesso ao seu Google Agenda:\n` +
					`${authUrl}\n\n` +
					`**Após autorizar, você receberá um código. Use o comando:**\n` +
					`\`/auth-google-calendar <código>\`\n\n` +
					`**Exemplo:**\n` +
					`\`/auth-google-calendar 4/0AfJohXn1234567890abcdef...\``,
				ephemeral: true
			});

			log.success(ck.green("URL de autorização do Google Agenda gerada"));
		} catch (error) {
			await interaction.reply({
				content: "❌ Erro ao gerar URL de autorização. Verifique se as credenciais do Google estão configuradas corretamente na .env.",
				ephemeral: true
			});
			log.error(ck.red(`Erro ao gerar URL de autorização: ${error}`));
		}
	},
});