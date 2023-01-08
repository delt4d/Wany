import styles from "@styles/Header.module.css"
import { useRouter } from "next/router";
import { SignOut } from "phosphor-react";
import { useAuth } from "@contexts/auth";
import UserAvatar from "@components/UserAvatar";
import LogoWhite from "/public/assets/images/logo-white.svg";

const Header = () => {
    const router = useRouter();
    const pathname = router.pathname;
    const auth = useAuth();

    return (
        <>
            <header className={pathname !== '/Signin' ? styles.Header : styles.HeaderSignin}>
                <div className={styles.Logo}>
                    <a href="/">
                        <LogoWhite />
                    </a>
                </div>

                {pathname !== '/Signin' &&
                    <>
                        <nav className={styles.Nav}>
                            <ul>
                                <li><a href="/">Home</a></li>

                                {auth.finished && !!auth.user && <li><a href="/Profile">Perfil</a></li>}

                                <li><a href="/Signin">Log In</a></li>
                            </ul>
                        </nav>

                        <div className={styles.UserInfo}>
                            <ul>
                                {auth.finished && !!auth.user &&
                                    <>
                                        <li className={styles.UserAvatar}>
                                            <a href="/Profile">
                                                <UserAvatar />
                                            </a>
                                        </li>

                                        {pathname === '/Profile' && <>
                                            <li>
                                                <a href="/Signout">
                                                    <SignOut size={22} />
                                                    sair
                                                </a>
                                            </li>

                                            {/* <li>
                                                <a href="/Signout">
                                                    <SignOut size={22} />
                                                    deletar
                                                </a>
                                            </li> */}
                                        </>
                                        }
                                    </>
                                }
                            </ul>
                        </div>
                    </>
                }
                {pathname !== '/Signin' && auth.finished && !auth.user &&
                    <div className={styles.GoLogin}>
                        <a href="/Signin">
                            Você não está logado. Clique para logar!
                        </a>
                    </div>
                }
            </header>

        </>
    )
}

export default Header;