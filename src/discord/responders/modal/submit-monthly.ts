import { Responder, ResponderType } from "#base";
import { db } from "#database";
import moment from "moment";
import { log } from "#settings";
import ck from "chalk";

new Responder({
	customId: "create-event-monthly",
	type: ResponderType.Modal,
	run: async (interaction) => {
            const name = interaction.fields.getTextInputValue("name");
            const dateInput = interaction.fields.getTextInputValue("date");
            const description = interaction.fields.getTextInputValue("description");

            const date = moment(dateInput, "DD/MM/YYYY", true);
            if (!date.isValid()) {
                interaction.reply({ content: "Data inválida. Use o formato DD/MM/YYYY.", ephemeral: true });
                return log.error(ck.red(`Data inválida. Use o formato DD/MM/YYYY.`))
            }
                
            try{
                await db.event.create({
                    data: {
                        name,
                        description,
                        type: "monthly",
                        time: date.toISOString()
                    }
                })

                interaction.reply({ content: `Evento criado!\n**Nome:** ${name}\n**Data e Hora:** ${date.format("DD/MM/YYYY [às] HH:mm")}\n**Descrição:** ${description}`, ephemeral: true });
                return log.success(ck.green(`Evento mensal: ${name} criado com sucesso!`))

            } catch(error){
                interaction.reply({ content: "Erro ao criar o evento.", ephemeral: true });
                return log.error(ck.red(`Erro ao criar o evento: ${error}`))
            }    
	},
})
