import { users } from "@api";
import { IAuthContextData } from "@contexts/auth";
import { NotificationTypes, showNotification } from "@helpers/notifications";

export interface IFormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement
    email: HTMLInputElement
    password: HTMLInputElement
}

export interface IFormElement extends HTMLFormElement {
    readonly elements: IFormElements
}

function normalizeFields({ email, password, username }: { email?: string, password?: string, username?: string }) {
    if (email) email = email.trim().toLowerCase().normalize();
    if (password) password = password.trim().normalize()
    if (username) username = username.trim().toLowerCase();

    return { email, password, username }
}

async function validateAuthenticationFields(elements: IFormElements) {
    if (!elements || !elements.email || !elements.password) {
        throw new Error("Ocorreu um problema ao tentar obter os dados do formulário!");
    }

    const fields = { email: elements.email.value, password: elements.password.value }
    const { email, password } = normalizeFields(fields)

    if (!email || !password) {
        throw new Error("Preencha todas os campos!");
    }

    return fields;
}

async function validateRegisterFields(elements: IFormElements) {
    if (!elements.email || !elements.password || !elements.username) {
        throw new Error("Ocorreu um problema ao tentar obter os dados do formulário!");
    }

    const fields = { email: elements.email.value, password: elements.password.value, username: elements.username.value }
    const { email, password, username } = normalizeFields(fields)

    if (!email || !password || !username) throw new Error("Preencha todas as informações corretamente!");
    if (password.length < 8) throw new Error("A senha deve ter ao menos 8 caracteres");

    let emailIsBeingUsed;

    try { emailIsBeingUsed = await users.emailBusy(email); }
    catch { throw new Error("Não foi possível fazer a verificação do email"); }

    if (emailIsBeingUsed) throw new Error("Este email já esta sendo usado");
    return fields;
}

export const authenticateUser = async (context: IAuthContextData, e: React.FormEvent<IFormElement>) => {
    e.preventDefault();

    try {
        const { email, password } = await validateAuthenticationFields(e.currentTarget.elements)
        const userId = await users.login(email, password);
        if (!userId) throw new Error("Não foi possível obter o id");
        await context.login(userId);
    }
    catch (err: any) {
        showNotification(err.message || "Não foi possível realizar o login", NotificationTypes.Error);
        return false;
    }

    showNotification("Autenticado com sucesso!", NotificationTypes.Success);
    return true;
}

export const registerUser = async (context: IAuthContextData, e: React.FormEvent<IFormElement>) => {
    e.preventDefault();

    try {
        const { email, password, username } = await validateRegisterFields(e.currentTarget.elements);

        const user = await users.create(email, password, username);

        if (!user?.id) throw new Error("Não foi possível obter o id")

        await users.login(email, password);
        await context.login(user.id);
    }
    catch (err: any) {
        showNotification(err.message || "Não foi possível realizar o cadastro", NotificationTypes.Error);
        return false;
    }

    showNotification("Cadastro realizado com sucesso!", NotificationTypes.Success);
    return true;
};