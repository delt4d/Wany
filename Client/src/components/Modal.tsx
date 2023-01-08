import styles from "@styles/Modal.module.css"
import { useEffect, useState } from "react";

interface ModalProps {
    title?: string
    children: React.ReactNode
}

const Modal = (props: ModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const master = document.querySelector("body")!.querySelector("div");
        master && (master.style.overflowY = (isOpen ? "hidden" : "flex"));
    }, [isOpen]);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    return (
        <section className={styles.Overlay + (isOpen ? ` ${styles.Open}` : "")}>
            <section className={styles.Modal}>
                <h1>{props.title ?? "Título"}</h1>
                {props.children}
            </section>
        </section>)
}

export default Modal;