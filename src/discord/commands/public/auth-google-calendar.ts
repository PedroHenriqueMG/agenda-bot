import { Command } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { googleCalendar } from "#base";
import { log } from "#settings";
import ck from "chalk";

new Command({
	name: "auth-google-calendar",
	description: "Autenticar com Google Agenda usando código",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "code",
			description: "Código de autorização do Google",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	run: async (interaction) => {
		const code = interaction.options.getString("code", true);

		try {
			await interaction.deferReply({ ephemeral: true });

			const tokens = await googleCalendar.getTokensFromCode(code);
			
			if (!tokens) {
				await interaction.editReply("❌ Código inválido ou expirado. Tente novamente.");
				return;
			}

			// Configurar credenciais no serviço
			await googleCalendar.setCredentials(
				tokens.access_token!, 
				tokens.refresh_token!, 
				tokens.expiry_date
			);

			await interaction.editReply(
				"✅ **Google Agenda configurado com sucesso!**\n\n" +
				"Seus tokens foram salvos na .env e agora todos os seus eventos serão criados diretamente no Google Agenda.\n\n" +
				"**Comandos disponíveis:**\n" +
				"• `/create-event` - Criar eventos\n" +
				"• `/get-events` - Listar eventos\n" +
				"• `/setup-google-calendar` - Reconfigurar (se necessário)"
			);

			log.success(ck.green("Google Agenda autenticado com sucesso"));
		} catch (error) {
			await interaction.editReply("❌ Erro ao autenticar com Google Agenda. Verifique se o código está correto e tente novamente.");
			log.error(ck.red(`Erro na autenticação do Google Calendar: ${error}`));
		}
	},
});