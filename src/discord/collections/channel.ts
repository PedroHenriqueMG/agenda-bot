import {Collection} from "discord.js"

export const channelCollection: Collection<string, {id: string, userId: string, username: string, userAvatar: string | null}> = new Collection()