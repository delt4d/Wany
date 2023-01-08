import styles from "@styles/Page404.module.css";
import { NextPage } from "next"

const Page404: NextPage = () => {
    return (
        <div className={styles.Main}>
            <h1>404 - Page Not Found</h1>
        </div>
    )
}

export default Page404