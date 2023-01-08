import { User } from "@models/users"
import { Criptography } from "@utils/criptography"
import { isUrl } from "@utils/isUrl"

interface MessageWithoutId {
    user: User
    message: string
    created_at: Date
}

interface Message extends MessageWithoutId {
    id: string
}

let messages: { [roomId: string]: Array<Message> } = {}

export function addMessageRoom(roomId: string) {
    if (!messages[roomId]) messages[roomId] = []
}

export function addMessage(roomId: string, message: MessageWithoutId) {
    const id = Criptography.generateUUIDV4() + message.created_at
    const newMessage: Message = { id, ...message }

    messages[roomId].push(newMessage)

    return newMessage
}

export function messageLinks(message: Message) {
    let messageList = message.message.replace(/\n/g, " ").split(" ")
    let linksList = messageList.filter(msg => isUrl(msg))
    if (!linksList.length) return false
    return [...new Set(linksList)]
}

export function getRoomMessages(roomId: string) {
    if (!messages[roomId]) return []
    return messages[roomId]
}

export function removeMessageRoom(roomId: string) {
    let { [roomId]: messageToRemove, ...otherMessages } = messages
    messages = otherMessages
}