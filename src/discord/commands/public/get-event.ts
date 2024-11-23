import { Command } from "#base";
import { db } from "#database";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import moment from "moment";

new Command({
	name: "get-event",
	description: "Create an event",
	type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "name",
            description: "Name of the event",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
	run: async (interaction) => {
        const name = interaction.options.getString("name");

            try{
                const event = await db.event.findUnique({
                    where: {
                        name: name!
                    }
                });
    
                if(!event){
                    return interaction.reply({ content: "Nenhum evento encontrado.", ephemeral: true });
                }
    
                
    
                const date = moment(event.time).format("DD/MM/YYYY [às] HH:mm");
    
                return interaction.reply({ content: `**Nome:** ${event.name}\n**Descrição:** ${event.description}\n**Data e Hora:** ${date}\n**Tipo:** ${event.type}`, ephemeral: true });
    
            } catch(error){
                return interaction.reply({ content: "Erro ao pegar os eventos.", ephemeral: true });
            }
	},
})
