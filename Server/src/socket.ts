import { Server } from "socket.io"
import http from "http"
import { appConfig } from "@config/app-config"
import { addUser, getUsersInRoom, removeUser } from "@utils/socket/users"
import { addRoom, getRoom, getRooms, getRoomStreamerUserId, removeRoom, updateRoomName } from "@utils/socket/room"
import { addMessage, addMessageRoom, getRoomMessages, messageLinks, removeMessageRoom } from "@utils/socket/messages"

export const socketConnection = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: appConfig.frontend,
            methods: ["GET", "POST"]
        }
    })

    io.on("connection", (socket) => {
        socket.on("get-streams-information", () => {
            const rooms = getRooms()

            rooms.slice(0, 10).forEach(room => {
                const messages = getRoomMessages(room.roomId);
                const users = getUsersInRoom(room.roomId);
                const streamer = users[room.streamerUserId];

                socket.emit("streams-information", rooms.map(room => ({
                    roomId: room.roomId,
                    roomName: room.name,
                    streamer: {
                        avatar: streamer.user.avatar,
                        username: streamer.user.username
                    },
                    messages: messages.slice(0, 5).map(message => ({ ...message, user: { username: message.user.username, avatar: message.user.avatar } })),
                    users: Object.values(users).map(value => ({ avatar: value.user.avatar, username: value.user.username }))
                })))
            })
        })

        socket.on("join-room", async (roomId: string, roomName: string, userId: string, peerId: string, isStreaming: boolean) => {
            // if this is not a stream and the room does not exists
            if (!isStreaming && !getRoom(roomId)) {
                socket.emit("error", "Esta sala não existe.")
                return;
            }

            socket.join(roomId)

            const myUserInRoom = getUsersInRoom(roomId)[userId];

            if (myUserInRoom !== undefined) {
                socket.emit("error", "Você já está nesta sala em outra instância do navegador.")
                return
            }

            if (!(await addUser(userId, socket.id, roomId, peerId))) {
                socket.leave(roomId)
                socket.emit("error", "Não foi possível encontrar os seus dados de usuário!")
                return
            }

            if (!roomName.length && isStreaming) {
                socket.leave(roomId)
                socket.emit("error", "É necessário um nome para iniciar a stream")
                return
            }

            if (isStreaming) {
                addRoom(roomId, roomName, userId)
            }

            socket.emit("connected-in-room")

            const users = getUsersInRoom(roomId)
            const room = getRoom(roomId)

            let messageOffset = 20
            let chatMessages = getRoomMessages(roomId)

            if (!chatMessages.length) {
                addMessageRoom(roomId)
                chatMessages = getRoomMessages(roomId)
            }

            // send that this user is connected to sockets in room
            socket.broadcast.to(roomId).emit("user-connected", { ...users[userId] })

            // send updated users list to clients
            socket.on("get-users-in-room", () => {
                const users = getUsersInRoom(roomId)
                io.to(roomId).emit("users-in-room", users)
            })

            // send room name to socket if he is not the streamer
            if (!isStreaming) io.to(socket.id).emit("room-name", room.name)

            // when streamer change room name
            socket.on("change-room-name", function (newRoomName: string) {
                if (typeof newRoomName !== "string" || !newRoomName.length || !isStreaming) {
                    return socket.emit("error", "Não foi possível atualizar o nome desta sala")
                }
                newRoomName = newRoomName.trim()
                updateRoomName(roomId, newRoomName)
                io.to(roomId).emit("room-name", newRoomName)
            })

            socket.on("get-messages-list", () => {
                const lastMessages = chatMessages.slice(-messageOffset)
                socket.emit("messages-list", lastMessages)
            })

            socket.on("send-message", async (message: string) => {
                if (typeof message !== "string" || !message.length) {
                    return socket.emit("error", "Não foi possível enviar a mensagem porque ela está vazia ou é inválida")
                }
                const newMessage = addMessage(roomId, { user: users[userId].user, message, created_at: new Date() })
                io.to(roomId).emit("message-received", newMessage)

                // try {
                //     const linkList = messageLinks(newMessage)

                //     if (linkList) {
                //         const cleanLink = (link: string) => {
                //             if (link.indexOf("http://") === 0) link.slice(7)
                //             else if (link.indexOf("https://") === 0) link.slice(8)
                //             if (link[link.length - 1] === "/") link.slice(0, -1)
                //             return link
                //         }
                //         linkList.forEach((link => {
                //             newMessage.message.replaceAll(link, `<a href="${link}">${cleanLink(link)}</a>`)
                //         }))

                //         io.to(roomId).emit("updated-message", newMessage)
                //     }
                // }
                // catch (ex) {
                //     console.error(ex);
                // }
            })

            socket.on("get-older-messages", (offset: number) => {
                // if don't have a offset, just return all the messages
                if (!offset || typeof offset !== "number") offset = -messageOffset

                messageOffset += offset

                const lastMessages = getRoomMessages(roomId).slice(-messageOffset)
                socket.emit("older-messages-received", lastMessages)

                if (lastMessages.length < messageOffset) {
                    socket.emit("all-older-messages-received", true)
                }
            })

            socket.on("request-send-call", (userId: string) => {
                const users = getUsersInRoom(roomId);
                const requestedUser = users[userId];

                if (!requestedUser) {
                    return socket.emit("error", "Não foi possível encontrar este usuário!");
                }

                io.to(requestedUser.socketId).emit("request-send-call");
            })

            socket.on("accept-requested-call", () => {
                const users = getUsersInRoom(roomId);
                const streamer = users[getRoomStreamerUserId(roomId)]
                if (!streamer) {
                    return socket.emit("error", "Não foi possível encontrar este usuário!");
                }
                io.to(streamer.socketId).emit("accept-requested-call", users[userId]);
            })

            socket.on("disconnect", () => {
                socket.broadcast.to(roomId).emit("user-disconnected", peerId)
                removeUser(socket.id)

                // if the user disconnected is the streamer, so end the stream
                if (isStreaming) {
                    socket.broadcast.to(roomId).emit("stream-end")
                    removeRoom(roomId)
                    removeMessageRoom(roomId)
                }
            })
        })
    })
}

    // const io = new Server(server, {
    //     cors: {
    //         origin: appConfig.frontend
    //     }
    // })

    // io.on("connection", (socket: Socket) => {
    //     // socket.to(room) send to the sender if he is in the room
    //     // socket.broadcast.to(room) send to all sockets in the room but the sender
    //     // io.to(room) send to all sockets in the room including the sender
    //     const usersRepository = new UserRepository()

    //     console.log(`Usuário conectado no socket ${socket.id}`)

    //     socket.on("ready", (roomId: string) => {
    //         socket.emit("me", socket.id)
    //         socket.join(roomId)
    //         socket.broadcast.to(roomId).emit('user_connected', socket.id)

    //         socket.on("disconnect", () => {
    //             // socket se desconectou
    //             io.to(roomId).emit("user_disconnected", socket.id)
    //         })

    //         socket.on("send_call", ({ to, from, userId }) => {
    //             // streamer manda a call para o usuário
    //             console.log("streamer sending call to", to)

    //             usersRepository.get(userId)
    //                 .then(user => {
    //                     socket.broadcast.to(to).emit("send_call", { from, user })
    //                 })
    //                 .catch((err: any) => {
    //                     // send error
    //                 })
    //         })

    //         socket.on("accept_call", ({ to, from, peerId, userId }) => {
    //             // usuário entrou na chamada
    //             console.log("call accepted")

    //             usersRepository.get(userId)
    //                 .then(user => {
    //                     socket.broadcast.to(to).emit("accept_call", { from, peerId, user })
    //                 })
    //                 .catch((err: any) => {
    //                     // send error
    //                 })
    //         })

    //         socket.on("message", ({ to, from, peerId, userId, message }) => {
    //             const toM = to != null ? `to ${to}` : `for all in stream`
    //             console.log(`user ${userId} sending message ${toM}`)

    //             usersRepository.get(userId)
    //                 .then(user => {
    //                     if (!to) io.to(roomId).emit("message", { from, peerId, user, message })
    //                     else io.to(to).emit("message", { from, peerId, user, message })
    //                 })
    //                 .catch((err: any) => {
    //                     // send error
    //                     console.log("nao foi possivel obter o usuario")
    //                 })
    //         })
    //     })
    // })