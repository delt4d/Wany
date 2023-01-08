import { Project } from "@api";
import { useAuth } from "@contexts/auth";
import { NotificationTypes, showNotification } from "@helpers/notifications";
import { createProject, getMyProjects, ICreateProjectFormElement } from "@services/projects";
import styles from "@styles/Profile.module.css";
import { Loading } from "notiflix";

const CreateProject = (props: { setList: React.Dispatch<React.SetStateAction<Project[]>> }) => {
    const auth = useAuth();

    const onSubmit = (e: React.FormEvent<ICreateProjectFormElement>) => {
        e.preventDefault();

        if (!auth.user) return;

        const elements = e.currentTarget.elements;
        const name = elements.name.value.trim();
        const files = elements.file.files;
        const description = elements.description.value.trim();

        if (!name) {
            showNotification("O nome do projeto é obrigatório", NotificationTypes.Error);
            return;
        }
        if (!files || files && files.length === 0) {
            showNotification("É necessário anexar um arquivo", NotificationTypes.Error);
            return;
        }
        const file = files[0];
        const image = (() => {
            const _ = elements.image?.files;
            return _ && _.length > 0 ? _[0] : null;
        })();

        Loading.circle("Enviando projeto...");

        createProject(auth.user.id, { name, file, image, description })
            .then(() => {
                showNotification("Upload realizado com sucesso", NotificationTypes.Success);

                props.setList([]);

                getMyProjects()
                    .then((project) => {
                        props.setList(project);

                        elements.name.value = "";
                        elements.file.value = "";
                        elements.description.value = "";
                        elements.image.value = "";

                    })
                    .catch((err) => {
                        console.error(err.message);
                        showNotification("Não foi possível carregar os projetos", NotificationTypes.Error);
                    })
                    .finally(() => {
                        Loading.remove();
                    })
            })
            .catch(err => {
                showNotification(err?.message ?? "Não foi possível criar o projeto", NotificationTypes.Error);
                Loading.remove();
            })
    }

    return (
        <section className={styles.CreateProject}>
            <h5>Criar um novo projeto</h5>

            <form onSubmit={onSubmit}>
                <div className={styles.CreateProject__body}>
                    <div>
                        <span>Nome do Projeto</span>
                        <input name="name" type="text" />
                    </div>

                    <div>
                        <span>Descrição do Jogo</span>
                        <textarea name="description"></textarea>
                    </div>

                    <div>
                        <span>Imagem do Projeto</span>
                        <input name="image" type="file" multiple={false} accept=".png,.jpg,.gif,.jpeg" />
                    </div>

                    <div>
                        <span>Arquivo</span>
                        <input name="file" type="file" multiple={false} accept=".zip,.rar,.7zip,.exe" />
                    </div>

                    <button type="submit" className={`${styles.BtnCreateProject} btn-primary`}>Criar</button>
                </div>
            </form>
        </section>
    )
}

export default CreateProject;