import { Event } from "#base"
import { createEmbed } from "@magicyan/discord"
import { googleCalendar } from "#base"
import { log } from "#settings"
import ck from "chalk"
import { channelCollection } from "#collections"
import cron from "node-cron"

new Event({
	name: "reminder",
	event: "ready",
	async run(client) {
		cron.schedule("0 8 * * *", async () => {
			try {
				if (!googleCalendar.isAuthenticated()) {
					log.warn(ck.yellow("Google Calendar não configurado. Lembretes desabilitados."));
					return;
				}

				const events = await googleCalendar.getTodayEvents();
                console.log(events);

				if (events.length === 0) {
					return log.info(ck.yellow(`Nenhum evento para hoje!`));
				}

				const channelId = channelCollection.get(process.env.CHANNEL_KEY)?.id;

				if (!channelId) {
					log.error(ck.red(`Canal de alertas não selecionado.`));
					return;
				}

				const channel = client.channels.cache.get(channelId);

				if (!channel?.isTextBased || channel.type !== 0) {
					log.error(ck.red(`Canal inválido para envio de mensagens.`));
					return;
				}

				for (const event of events) {
					const eventType = event.extendedProperties?.private?.eventType || 'evento';
					const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start?.date || '');
					const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end?.date || '');

					const embed = createEmbed({
						title: eventType === 'monthly' ? "🔄 Evento mensal de hoje!" : "�� Você tem um evento para hoje!",
						author: {
							name: `${channelCollection.get(process.env.CHANNEL_KEY)?.username}`,
							iconURL: `${channelCollection.get(process.env.CHANNEL_KEY)?.userAvatar}`
						},
						color: "Red",
						fields: [
							{
								name: "Nome do evento",
								value: event.summary || 'Sem título'
							},
							{
								name: "Descrição",
								value: event.description || 'Sem descrição'
							},
							{
								name: "Horário",
								value: `${startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
							}
						],
						timestamp: startTime
					});

					await channel.send({ embeds: [embed] });
					await channel.send(`<@${channelCollection.get(process.env.CHANNEL_KEY)?.userId}>`);

					if (eventType === 'fixed' && event.id) {
						try {
							await googleCalendar.deleteEvent(event.id);
							log.success(ck.green(`Evento fixo deletado do Google Agenda: ${event.summary}`));
						} catch (error) {
							log.warn(ck.yellow(`Erro ao deletar evento do Google Agenda: ${error}`));
						}
					}

					log.success(ck.green(`Lembrete enviado com sucesso! Evento: ${event.summary}`));
				}
			} catch (error) {
				log.error(ck.red(`Erro no sistema de lembretes: ${error}`));
			}
		});
	},
})