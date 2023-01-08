import { User, users } from "@api";
import { SocketContext } from "@contexts/socket";
import { bufferToUrlObject } from "@helpers/blob-convertions";
import { useContext, useEffect, useState } from "react";

interface Message {
    user: {
        avatar: Buffer
        username: string
    }
    message: string
    created_at: Date
}

interface StreamInformation {
    roomId: string
    roomName: string
    streamer: {
        avatar: Buffer
        username: string
    }
    messages: Message[]
    users: {
        avatar: Buffer
        username: string
    }[]
}

const StreamingListContainer = () => {
    const { socket } = useContext(SocketContext)
    const [streamInformation, setStreamInformation] = useState<StreamInformation[]>([]);

    useEffect(() => {
        socket.on("streams-information", (data: StreamInformation[]) => {
            setStreamInformation(data)
        });
        socket.emit("get-streams-information");
    }, []);

    return (
        <section>
            {streamInformation.map(item => <div>
                <span>Streamer: {item.streamer.username}</span>
                <img src={bufferToUrlObject(item.streamer.avatar)}></img>

                <div>
                    <span>{item.users.length} usuários na live</span>
                    {item.users.map(user => <div>
                        <img src={bufferToUrlObject(user.avatar)} title={user.username} />
                    </div>)}
                </div>

                <div>
                    <span>últimas mensagens</span>
                    {item.messages.map(message => <div>
                        <img src={bufferToUrlObject(message.user.avatar)} title={message.user.username} />
                        <span>{message.user.username}</span>
                        <span>message: {message.message}</span>
                    </div>)}
                </div>
            </div>)}
        </section>
    )
}

export default StreamingListContainer;