import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@contexts/auth"
import { NotificationTypes, showNotification } from "@helpers/notifications";

const Signout: NextPage = () => {
    const router = useRouter();
    const auth = useAuth();

    const [loaded, setLoaded] = useState(false);
    const [logout, setLogout] = useState(false);

    useEffect(() => {
        if (loaded) return;

        auth
            .logout()
            .finally(() => {
                showNotification("Deslogado do sistema com sucesso!", NotificationTypes.Info);
                setLoaded(true);
                setLogout(true);
            })
    }, []);

    useEffect(() => {
        if (logout == true) {
            router.push("/Signin");
        }
    }, [logout]);

    return (<></>)
}

export default Signout