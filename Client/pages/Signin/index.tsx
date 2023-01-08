import { NextPage } from "next";
import { EnvelopeSimple, Eye, EyeClosed, Password, User } from 'phosphor-react';
import { useAuth } from '@contexts/auth';
import { useEffect, useState } from "react"
import { authenticateUser, IFormElement, registerUser } from '@services/users';
import styles from "@styles/Signin.module.css"
import { NotificationTypes, showNotification } from '@helpers/notifications';
import { Loading } from 'notiflix';
import { useRouter } from "next/router";

const Signin: NextPage = () => {
    const [isLoginPage, setIsLoginPage] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [authComplete, setAuthComplete] = useState(false);

    const router = useRouter();
    const redirect = router.push;
    const context = useAuth();

    async function login(e: React.FormEvent<IFormElement>) {
        Loading.circle();
        try {
            if (await authenticateUser(context, e)) { setAuthComplete(true); }
            Loading.remove();
        }
        catch (err: any) {
            showNotification(err.message, NotificationTypes.Error);
            Loading.remove();
        }
    }

    async function register(e: React.FormEvent<IFormElement>) {
        Loading.circle();
        try {
            if (await registerUser(context, e)) { setAuthComplete(true); }
            Loading.remove();
        }
        catch (err: any) {
            showNotification(err.message, NotificationTypes.Error);
            Loading.remove();
        }
    }

    useEffect(() => {
        if (authComplete == true) {
            context.updateUserData()
                .then(() => {
                    setTimeout(() => {
                        redirect("/");
                    }, 500);
                })
                .catch((err: any) => {
                    console.error(err?.message);
                    showNotification("Não foi possível carregar as informações... tente novamente mais tarde.", NotificationTypes.Error)
                })
        }
    }, [authComplete]);

    useEffect(() => {
        document.title = "Login";
    }, [])

    return (
        <section className={styles.SigninContainer}>
            <h1>{isLoginPage ? "Login" : "Cadastro"}</h1>

            <section className={styles.Form}>
                <form onSubmit={isLoginPage ? login : register}>
                    {!isLoginPage &&
                        <div className={styles.FormGroup}>
                            <div className={styles.DivInput}>
                                <i><User size={24} /></i>
                                <input name="username" type="text" placeholder="Username" spellCheck={false} aria-autocomplete='none' aria-required='true' />
                            </div>
                        </div>
                    }

                    <div className={styles.FormGroup}>
                        <div className={styles.DivInput}>
                            <span><EnvelopeSimple size={24} /></span>
                            <input name="email" type="email" placeholder="Email" spellCheck={false} aria-autocomplete='none' aria-required='true' />
                        </div>
                    </div>

                    <div className={styles.FormGroup}>
                        <div className={styles.DivInput}>
                            <span><Password size={24} /></span>
                            <input name="password" type={showPassword ? "text" : "password"} spellCheck={false} placeholder="Senha" aria-autocomplete='none' aria-required='true' />
                            <span>
                                {showPassword ?
                                    <Eye size={24} cursor="pointer" onClick={() => setShowPassword(false)} /> :
                                    <EyeClosed size={24} cursor="pointer" onClick={() => setShowPassword(true)} />
                                }
                            </span>
                        </div>
                    </div>

                    <div className={styles.FormGroupSubmit}>
                        <div>
                            <button type='submit' className={"btn-primary " + styles.BtnSubmit}>{isLoginPage ? "Entrar" : "Cadastrar"}</button>
                            <span className={styles.LinkChangeForm} onClick={() => setIsLoginPage(!isLoginPage)}>{isLoginPage ? "criar uma conta" : "fazer login"}</span>
                        </div>
                    </div>
                </form>
            </section>
        </section>
    )
}

export default Signin