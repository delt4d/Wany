import { Project, projects } from "@api";
import { useAuth } from "@contexts/auth";
import { bufferToUrlObject } from "@helpers/blob-convertions";
import { NotificationTypes, showNotification } from "@helpers/notifications";
import { deleteProject, getMyProjects } from "@services/projects";
import styles from "@styles/Profile.module.css";
import { useRouter } from "next/router";
import { Block, Confirm, Loading } from "notiflix";
import { useEffect, useRef, useState } from "react";

interface IMyProjectsProps {
    list: Project[],
    setList: React.Dispatch<React.SetStateAction<Project[]>>
}

const MyProjects = ({ list, setList }: IMyProjectsProps) => {
    const auth = useAuth();
    const router = useRouter();

    const deleteGame = (id: string) => {
        const gameIndex = list.findIndex(item => item.id === id);
        if (gameIndex === -1) return;
        const game = list[gameIndex];

        function okCallback() {
            Loading.circle("Excluindo projeto...");

            deleteProject(game.id)
                .then(() => {
                    showNotification("Projeto excluído com sucesso!", NotificationTypes.Success);
                    setList((oldProjects: Project[]) => oldProjects.filter(_project => _project.id !== game.id));
                })
                .catch((err: any) => {
                    console.error(err.message);
                    showNotification("Não foi possível excluir o projeto", NotificationTypes.Error);
                })
                .finally(() => {
                    Loading.remove();
                });
        }

        Confirm.show("Excluir projeto", `Você tem certeza que deseja excluir o projeto "${game.name}"?`, "Excluir", "Cancelar", okCallback, undefined, {
            titleColor: "var(--primary-color)",
            okButtonBackground: "var(--primary-color)"
        })
    }
    const updateGame = (id: string) => { }

    const projectsContainerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (auth.user && projectsContainerRef.current) {
            const element = projectsContainerRef.current;

            Block.circle([element], "Carregando projetos...", {
                backgroundColor: "transparent",
                messageColor: "#fff",
                svgColor: "#fff",
            });

            getMyProjects()
                .then(projects => {
                    setList([...projects]);
                })
                .catch(err => {
                    console.error(new Error(err.message));
                    showNotification("Não foi possível carregar os projetos", NotificationTypes.Error);
                })
                .finally(() => {
                    Block.remove([element]);
                });
        }
    }, [auth.user, projectsContainerRef.current]);

    useEffect(() => {
        if (auth.finished && !auth.user) {
            router.push("/Signin");
            return;
        }
    }, [auth.finished]);

    return (
        <>
            <section ref={projectsContainerRef} id="MyProjectsContainer" className={styles.MyProjectsContainer}>
                {list.map((game, index) =>
                    <div key={index} className={styles.MyProject}>
                        <h6 title={game.name}>{game.name}</h6>

                        <div className={styles.DivImage}>
                            {game.image && <img src={bufferToUrlObject(game.image.data)}></img>}
                        </div>

                        <div className={styles.DivBottom}>
                            {/* <button onClick={() => updateGame(game.id)} className="btn-update-project">Atualizar</button> */}
                            <button onClick={() => projects.download(game.id)} className="btn-download-project">Download</button>
                            <button onClick={() => deleteGame(game.id)} className="btn-delete-project">Excluir</button>
                        </div>
                    </div>)
                }
            </section>
        </>
    )
}

export default MyProjects;