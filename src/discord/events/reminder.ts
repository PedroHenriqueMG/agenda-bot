import { Event } from "#base"
import { createEmbed } from "@magicyan/discord"
import { db } from "db/db.js"
import { channelCollection } from "discord/collections/channel.js"
import cron from "node-cron"

new Event({
	name: "reminder",
	event: "ready",
	async run(client) {
        cron.schedule("* * * * *", async () => {
            const now = new Date();
            const day = now.getDate().toString().padStart(2, "0");
           
            const allEvents = await db.event.findMany()
            const events = allEvents.filter(e => new Date(e.time).getDate().toString().padStart(2, "0") === day)

            if(!events.length) return

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
                        return
                    }
                    
                }
            }
        })
	},
})
