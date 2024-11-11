import { Command } from "#base";
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

new Command({
	name: "create-event",
	description: "Create an event",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "fixed",
			description: "Name of the event",
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: "monthly",
			description: "Name of the event",
			type: ApplicationCommandOptionType.Subcommand,
		}
	],
	run(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "fixed") {
			const modal = new ModalBuilder({
				customId: "create-event-fixed",
				title: "Crie seu evento fixo"
			});
	
			const nameInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder({
					customId: "name",
					label: "Nome do evento",
					style: TextInputStyle.Short,
					minLength: 1,
					maxLength: 100,
					required: true
				})
			);
	
			const dateInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder({
					customId: "date",
					label: "Data do evento (ex: 25/12/2024)",
					style: TextInputStyle.Short,
					minLength: 10,
					maxLength: 10,
					required: true
				})
			);
	
			const descriptionInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder({
					customId: "description",
					label: "Descrição do evento",
					style: TextInputStyle.Paragraph,
					minLength: 1,
					maxLength: 500,
					required: false
				})
			);

			const timeInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder({
					customId: "time",
					label: "Hora do evento (ex: 14:30)",
					style: TextInputStyle.Short,
					minLength: 5,
					maxLength: 5,
					required: true
				})
			);
	
			 modal.addComponents(nameInput, dateInput, descriptionInput, timeInput);
			return interaction.showModal(modal);
		}
		
		const modal = new ModalBuilder({
			customId: "create-event-monthly",
			title: "Crie seu evento mensal"
		});

		const nameInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder({
				customId: "name",
				label: "Nome do evento",
				style: TextInputStyle.Short,
				minLength: 1,
				maxLength: 100,
				required: true
			})
		);

		const dateInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder({
				customId: "date",
				label: "Data do evento (ex: 25/12/2024)",
				style: TextInputStyle.Short,
				minLength: 10,
				maxLength: 10,
				required: true
			})
		);

		const descriptionInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
			new TextInputBuilder({
				customId: "description",
				label: "Descrição do evento",
				style: TextInputStyle.Paragraph,
				minLength: 1,
				maxLength: 500,
				required: false
			})
		);

		 modal.addComponents(nameInput, dateInput, descriptionInput);
		 return interaction.showModal(modal);
	},
})
