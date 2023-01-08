import { User, UserRepository } from "@models/users"

interface SocketUser {
    socketId: string
    peerId: string
    roomId: string
    user: User
}

let users: { [userId: string]: SocketUser } = {}

const usersRepository = new UserRepository()

export async function addUser(userId: string, socketId: string, roomId: string, peerId: string): Promise<boolean> {
    const user = await usersRepository.get(userId)
    if (!user) return false
    users[userId] = { socketId, roomId, user, peerId }
    return true
}

export function removeUser(socketId: string) {
    users = Object.fromEntries(Object.entries(users).filter(([k, user]) => socketId !== user.socketId))
}

export function getUsersInRoom(roomId: string) {
    return Object.fromEntries(Object.entries(users).filter(([k, user]) => roomId === user.roomId))
}