import { WhatsappLogo } from "phosphor-react"
import { useRouter } from "next/router";
import styles from "../styles/Footer.module.css"

export default () => {
    const router = useRouter();
    const pathname = router.pathname;

    if (pathname != '/Signin') return (
        <section className={styles.Footer}>
            <span className="copyright">
                Todos os direitos reservados 2022 &copy; Leandro Gabriel da Cruz & Guilherme Cristiano Maia dos Santos
            </span>
            <WhatsappLogo size={20} />
        </section>
    )
    else return <></>;
}