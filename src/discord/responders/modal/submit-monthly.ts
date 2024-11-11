import { Responder, ResponderType } from "#base";
import moment from "moment";

new Responder({
	customId: "create-event-monthly",
	type: ResponderType.Modal,
	run: async (interaction) => {
            const name = interaction.fields.getTextInputValue("name");
            const dateInput = interaction.fields.getTextInputValue("date");
            const description = interaction.fields.getTextInputValue("description");

            const date = moment(dateInput, "DD/MM/YYYY", true);
            if (!date.isValid()) {
                return interaction.reply({ content: "Data inválida. Use o formato DD/MM/YYYY.", ephemeral: true });
            }
    
            return interaction.reply(`Evento criado!\n**Nome:** ${name}\n**Data e Hora:** ${date.format("DD/MM/YYYY [às] HH:mm")}\n**Descrição:** ${description}`);
	},
})
