import { Event } from "#base"
import { createEmbed } from "@magicyan/discord"
import { db } from "#database"
import { log } from "#settings"
import ck from "chalk"
import { channelCollection } from "#collections"
import cron from "node-cron"

new Event({
	name: "reminder",
	event: "ready",
	async run(client) {
        cron.schedule("0 8 * * *", async () => {
            const now = new Date();
            const day = now.getDate().toString().padStart(2, "0");
           
            const allEvents = await db.event.findMany().catch((error) => {
                log.error(ck.red(`Erro ao buscar os eventos: ${error.message}`))
                return []
            })
            const events = allEvents.filter(e => new Date(e.time).getDate().toString().padStart(2, "0") === day)

            if(!events.length) return log.info(ck.yellow(`Nenhum evento para hoje!`))

            const channelId = channelCollection.get(process.env.CHANNEL_KEY)?.id

            for(const event of events) {
                if(channelId){
                    const channel = client.channels.cache.get(channelId)
        
                    if(channel?.isTextBased && channel.type === 0) {
                        if(event.type === "fixed") {
                            const embed = createEmbed({
                                title: "Você tem um evento para hoje!",
                                author: {
                                    name: `${channelCollection.get(process.env.CHANNEL_KEY)?.username}`,
                                    iconURL: `${channelCollection.get(process.env.CHANNEL_KEY)?.userAvatar}`
                                },
                                color: "Red",
                                fields: [
                                    {
                                        name: "Nome do evento",
                                        value: event.name
                                    },
                                    {
                                        name: "Descrição",
                                        value: event.description
                                    },
                                ],
                                timestamp: new Date(event.time)
                            })

                           channel?.send({ embeds: [embed] })
                           await db.event.delete({ where: { id: event.id } })
                           return log.success(ck.green(`Mensagem enviada com sucesso! \n evento: ${event.name}`))
                        }
                        
                        
                        if(event.type === "monthly") {
                            const embed = createEmbed({
                                title: "Evento mensal de hoje!",
                                author: {
                                    name: `${channelCollection.get(process.env.CHANNEL_KEY)?.username}`,
                                    iconURL: `${channelCollection.get(process.env.CHANNEL_KEY)?.userAvatar}`
                                },
                                color: "Red",
                                fields: [
                                    {
                                        name: "Nome do evento",
                                        value: event.name
                                    },
                                    {
                                        name: "Descrição",
                                        value: event.description
                                    },
                                ],
                            })
                            
                            channel?.send({ embeds: [embed] })
                        }

                        channel?.send(`<@${channelCollection.get(process.env.CHANNEL_KEY)?.userId}>`)
                        return log.success(ck.green(`Mensagem enviada com sucesso! \n evento: ${event.name}`))
                    }
                    
                }
                log.error(ck.red(`Canal de alertas nao selecionado.`))
            }
        })
	},
})
