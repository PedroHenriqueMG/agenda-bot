import { Event } from "#base"
import { db } from "db/db.js"
import { channelCollection } from "discord/collections/channel.js"
import cron from "node-cron"
import moment from "moment"

new Event({
	name: "reminder",
	event: "ready",
	async run(client) {
        cron.schedule("* * * * *", async () => {
            const now = new Date();
            now.setHours(0, 0, 0, 0); 
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999); 
           

            const events = await db.event.findMany({
                where: {
                    time: {
                        gte: now,      
                        lt: endOfDay,  
                    },
                }
            })

            if(!events.length) return

            const channelId = channelCollection.get(process.env.CHANNEL_KEY)?.id

            for(const event of events) {
                if(channelId){
                    const channel = client.channels.cache.get(channelId)
        
                    const date = moment(event.time, "DD/MM/YYYY", true);
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
