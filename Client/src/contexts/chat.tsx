import { User } from "@api";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ISocketContextData, SocketContext } from "./socket";

export interface IChatProps {
    children: ReactNode
}

export interface IChatContextData {
    messageList: Array<Message>
    hasOlderMessages: boolean
    hasInitMessages: boolean
    setMessage: React.Dispatch<React.SetStateAction<string>>
}

interface Message {
    id: string
    user: User
    message: string
    created_at: Date
}

export const ChatContext = createContext<IChatContextData>({} as IChatContextData);
export const ChatContextProvider: React.FC<IChatProps> = ({ children }: IChatProps) => {
    const [message, setMessage] = useState("");
    const [hasOlderMessages, setHasOlderMessages] = useState(true);
    const [messageList, setMessageList] = useState<Array<Message>>([]);
    const [hasInitMessages, setHasInitMessages] = useState(false);

    const { socket, stream } = useContext<ISocketContextData>(SocketContext)

    const handleMessageReceived = (message: Message) => {
        setMessageList(messages => [...messages, message]);
    };

    const handleUpdatedMessage = (message: Message) => {
        setMessageList(messages =>
            messages.map(msg => {
                if (msg.id === message.id) return message;
                return msg;
            }));
    };

    const handleOlderMessagesReceived = (messages: Message[]) => {
        setMessageList([...messages]);
    };

    const handleAllOlderMessagesReceived = (hasMessages: boolean) => {
        setHasOlderMessages(false);
    };

    const handleMessagesList = (messages: Message[]) => {
        setMessageList(msgs => [...msgs, ...messages]);
        setHasInitMessages(hasMsgs => true);
    };

    useEffect(() => {
        const handleJoinedRoom = () => {
            socket.emit("get-message-list");
        }

        if (!socket) return;

        if (message && message.trim().length) {
            socket.emit("send-message", message);
            setMessage('');
        }
        if (hasOlderMessages) {
            socket.emit("get-older-messages", 20);
        }

        socket.on("connected-in-room", handleJoinedRoom);
        socket.on("message-received", handleMessageReceived);
        socket.on("updated-message", handleUpdatedMessage);
        socket.on("older-messages-received", handleOlderMessagesReceived);
        socket.on("messages-list", handleMessagesList);
        socket.on("all-older-messages-received", handleAllOlderMessagesReceived);

        return () => {
            if (socket) {
                socket.removeListener("joined-room", handleJoinedRoom);
                socket.removeListener("message-received", handleMessageReceived);
                socket.removeListener("updated-message", handleUpdatedMessage);
                socket.removeListener("older-messages-received", handleOlderMessagesReceived);
                socket.removeListener("messages-list", handleMessagesList);
                socket.removeListener("all-older-messages-received", handleAllOlderMessagesReceived);
            }
            else {
                setHasOlderMessages(true);
                setMessageList([]);
                setHasInitMessages(false);
                setMessage("");
            }
        };
    }, [socket, message, stream?.id, hasOlderMessages]);

    return (
        <ChatContext.Provider value={{
            messageList,
            hasOlderMessages,
            hasInitMessages,
            setMessage,
        }}>
            {children}
        </ChatContext.Provider>
    )
}
