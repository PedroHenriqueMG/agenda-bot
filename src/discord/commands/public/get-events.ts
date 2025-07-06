import { Command } from "#base";
import { log } from "#settings";
import ck from "chalk";
import { ApplicationCommandType } from "discord.js";

new Command({
	name: "get-events",
	description: "Create an event",
	type: ApplicationCommandType.ChatInput,
	run: async (interaction) => {

            try{
                // const events = await db.event.findMany();
    
                // if(events.length === 0) {
                //     interaction.reply({ content: "Nenhum evento encontrado.", ephemeral: true });
                //     return log.success(ck.green(`Nenhum evento encontrado.`))
                // }
    
                // for(const event of events) {
                //     const date = moment(event.time).format("DD/MM/YYYY [às] HH:mm");
        
                //     interaction.reply({ content: `**Nome:** ${event.name}\n**Descrição:** ${event.description}\n**Data e Hora:** ${date}\n**Tipo:** ${event.type}`, ephemeral: true })
                //     return log.success(ck.green(`Eventos encontrados com sucesso!`))
                // }
    
            } catch(error){
                const newError = error as Error
                interaction.reply({ content: "Erro ao pegar os eventos.", ephemeral: true });
                return log.error(ck.red(`Erro ao pegar os eventos: ${newError.message}`))
            }
	},
})
