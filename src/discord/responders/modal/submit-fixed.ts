import { Responder, ResponderType } from "#base";
import { db } from "db/db.js";
import moment from "moment";

new Responder({
	customId: "create-event-fixed",
	type: ResponderType.Modal,
	run: async (interaction) => {
            const name = interaction.fields.getTextInputValue("name");
            const dateInput = interaction.fields.getTextInputValue("date");
            const description = interaction.fields.getTextInputValue("description");
            const timeInput = interaction.fields.getTextInputValue("time");
    
            const date = moment(dateInput, "DD/MM/YYYY", true);
            if (!date.isValid()) {
                return interaction.reply({ content: "Data inválida. Use o formato DD/MM/YYYY.", ephemeral: true });
            }
    
            let time;
            if (timeInput) {
                time = moment(timeInput, "HH:mm", true);
                if (!time.isValid()) {
                    return interaction.reply({ content: "Hora inválida. Use o formato HH:MM.", ephemeral: true });
                }
            }
    
            const eventDateTime = time ? date.set({ hour: time.hours(), minute: time.minutes() }) : date;
            const newDate = new Date(eventDateTime.toISOString());

            try{
                await db.event.create({
                    data: {
                        name,
                        description,
                        time: newDate
                    }
                })
                return interaction.reply({ content: `Evento criado!\n**Nome:** ${name}\n**Data e Hora:** ${date.format("DD/MM/YYYY [às] HH:mm")}\n**Descrição:** ${description}`, ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: "Erro ao criar evento.", ephemeral: true });
            }
	},
})
