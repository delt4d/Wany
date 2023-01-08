import { useAuth } from "@contexts/auth";
import { ChatContext } from "@contexts/chat";
import { SocketContext } from "@contexts/socket";
import { bufferToUrlObject } from "@helpers/blob-convertions";
import styles from "@styles/ChatContainer.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import useInput from "src/hooks/useInput";

interface IChatContainerProps { }

const ChatContainer = ({ }: IChatContainerProps) => {
    const auth = useAuth();

    const { setMessage, messageList } = useContext(ChatContext);
    const { usersConnected } = useContext(SocketContext);

    const pesquisa = useInput("");

    const sendMessage = useCallback(() => {
        setMessage(pesquisa.value);
        pesquisa.clear();
    }, [pesquisa.value]);

    const renderMessages = () => {
        return messageList.map(
            (message, index) => {
                const user = message.user.id == auth.user?.id ? auth.user : message.user;
                const image: any = user.avatar;

                return (
                    <div key={index} className={styles.Block}>
                        <img src={user.avatar ? bufferToUrlObject(Buffer.from(image)) : "https://picsum.photos/200/200"} />
                        <div>
                            <span>{user.username}</span>
                            <span>{message.message}</span>
                        </div>
                    </div>
                )
            })
    }

    return (
        <div id={styles.Container}>
            <h1 className={styles.Title}>Mensagens</h1>
            <span className={styles.UsersOnline}>
                <>{Object.keys(usersConnected).length} usuários</>
            </span>

            <div className={styles.Content}>
                {renderMessages()}
            </div>

            <div className={styles.DivPesquisa}>
                <input onChange={pesquisa.onChange} className={styles.Pesquisa} type="text" value={pesquisa.value} />
                <input onClick={sendMessage} className={styles.BtnEnviar} type="button" value="Enviar" />
            </div>
        </div>
    )

}

export default ChatContainer;