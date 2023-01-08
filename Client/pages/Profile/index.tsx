import { NextPage } from "next";
import UserAvatar from "@components/UserAvatar";
import styles from "@styles/Profile.module.css";
import { CircleWavyCheck } from "phosphor-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@contexts/auth";
import { NotificationTypes, showNotification } from "@helpers/notifications";
import { Project, users } from "@api";
import { Loading } from "notiflix";
import MyProjects from "@components/MyProjects";
import CreateProject from "@components/CreateProjects";


const Profile: NextPage = () => {
    const auth = useAuth();
    const router = useRouter();

    const [list, setList] = useState<Project[]>([]);

    const navigate = router.push;
    const goStreaming = () => navigate("/Stream/Live");

    const changeAvatar = (e: any) => {
        const input: any = e.target;
        if (!auth.user || !input) return;

        const files = input.files;
        const file = files[0];

        if (!file) return;

        Loading.circle("Enviando imagem...");

        users.setAvatar(auth.user.id, file)
            .then(() => {
                auth.updateUserData();
                showNotification("Avatar alterado com sucesso!", NotificationTypes.Success);
            })
            .catch((err: any) => {
                showNotification(err.message || "Não foi possível mudar o avatar", NotificationTypes.Error);
            })
            .finally(() => {
                Loading.remove();
                input.value = "";
            });
    }

    useEffect(() => {
        if (auth.finished && !auth.user) {
            showNotification("Você precisa se logar para acessar seu perfil!", NotificationTypes.Warning);
            router.push("/Signin");
        }
    }, [auth.finished]);

    useEffect(() => {
        Loading.circle("Carregando...");
        document.title = "Perfil";
        setTimeout(() => {
            Loading.remove();
        }, 500);
    }, [])

    return (
        <section className={styles.ProfileContainer}>
            {auth.user &&
                <>
                    <section className={styles.UserInformation}>
                        <div className={styles.UserAvatar}>
                            <div className={styles.UserAvatar__image}>
                                <UserAvatar />
                            </div>

                            <CircleWavyCheck className={styles.UserVerified} size={32} />
                        </div>

                        <div className={styles.UserInformation__content}>
                            <h6 className={styles.UserName}>Olá, {auth.user.username}.</h6>
                            <br />
                            <div>
                                <label>Alterar Avatar</label><br />
                                <input onChange={changeAvatar} type="file" accept="image/*" />
                            </div>
                        </div>
                    </section>

                    <section className={styles.StreamsContainer}>
                        <h2 className={styles.StreamsContainerTitle}>Streams</h2>
                        <div className={styles.StartStream}>
                            <button className={`btn-primary ${styles.BtnStartStream}`} onClick={goStreaming}>INICIAR STREAM</button>
                        </div>
                    </section>

                    <section className={styles.ProjectsContainer}>
                        <h2 className={styles.ProjectsContainerTitle}>Projetos</h2>
                        <CreateProject setList={setList} />
                    </section>

                    <MyProjects list={list} setList={setList} />
                </>
            }
        </section>
    )
}

export default Profile