interface SocketRoom {
    name: string
    created_at: Date
    streamerUserId: string
}

let rooms: { [key: string]: SocketRoom } = {}

export function addRoom(roomId: string, name: string, streamerUserId: string) {
    if (!rooms[roomId]) rooms[roomId] = {
        name,
        created_at: new Date(),
        streamerUserId
    }
}

export function removeRoom(roomId: string) {
    let { [roomId]: toRemove, ...otherRooms } = rooms
    rooms = otherRooms
}

export function getRoom(roomId: string) {
    console.log(rooms)
    return rooms[roomId]
}

export function updateRoomName(roomId: string, newRoomName: string) {
    rooms[roomId].name = newRoomName
}

export function getRoomStreamerUserId(roomId: string) {
    return rooms[roomId].streamerUserId
}

export function getRooms() {
    return Object.entries(rooms).map(([key, value]) => ({ ...value, roomId: key }));
}