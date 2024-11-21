import {Collection} from "discord.js"

export const channelCollection: Collection<string, {id: string, userId: string}> = new Collection()