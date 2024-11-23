import { Event } from "#base"
import { db } from "db/db.js"
import { channelCollection } from "discord/collections/channel.js"
import cron from "node-cron"
import moment from "moment"

new Event({
	name: "reminder",
	event: "ready",
	async run(client) {
        cron.schedule("0 8 * * *", async () => {
            const now = new Date();
            const day = now.getDate().toString().padStart(2, "0");
           
            const allEvents = await db.event.findMany()
            const events = allEvents.filter(e => new Date(e.time).getDate().toString().padStart(2, "0") === day)

            if(!events.length) return

            const channelId = channelCollection.get(process.env.CHANNEL_KEY)?.id

            for(const event of events) {
                if(channelId){
                    const channel = client.channels.cache.get(channelId)
        
                    const date = moment(new Date(event.time), "DD/MM/YYYY", true);
                    if(channel?.isTextBased && channel.type === 0) {
                        if(event.type === "fixed") {
                           channel?.send(`<@${channelCollection.get(process.env.CHANNEL_KEY)?.userId}> Você tem um evento para hoje!\n**Nome:** ${event.name}\n**Data e Hora:** ${date.format("DD/MM/YYYY [às] HH:mm")}\n**Descrição:** ${event.description}`)
                            await db.event.delete({ where: { id: event.id } })
                            return
                        }


                        if(event.type === "monthly") {
                           channel?.send(`<@${channelCollection.get(process.env.CHANNEL_KEY)?.userId}> Você tem um evento para hoje!\n**Nome:** ${event.name}\n**Data e Hora:** ${date.format("DD/MM/YYYY")}\n**Descrição:** ${event.description}`)
                           return
                        }
                    }
                    
                }
            }
        })
	},
})
