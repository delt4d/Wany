import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, User, users } from "@api";

export interface IAuthContextData {
    finished: boolean
    user: User | null
    login(userId: string): Promise<boolean>
    logout(): Promise<void>
    updateUserData(): Promise<User | null>
    setUser(data: User): void
}

export interface IAuthProps {
    children: ReactNode
}

export const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);
export const AuthProvider: React.FC<IAuthProps> = ({ children }: IAuthProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [finished, setFinished] = useState(false);
    const [loaded, setLoaded] = useState(false);

    async function login() {
        const oneDay = 60 * 60 * 24 * 1000
        const tomorrow = new Date(new Date().getTime() + oneDay);
        localStorage.setItem("@App:logged", JSON.stringify({ expiration: tomorrow }));
        return true;
    }

    async function logout() {
        setUser(null);
        await users.logout();
        localStorage.removeItem("@App:logged");
    }

    function updateUserData(): Promise<User | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const u = await users.get();

                if (!u) {
                    console.log("nenhum usuário");
                    await logout();
                    resolve(null);
                }
                setUser(u);
                resolve(u ?? null);

            } catch (err: any) {
                reject(err);
            }
        })
    }

    useEffect(() => {
        if (!loaded) {
            setLoaded(true);

            updateUserData()
                .catch((err: any) => {
                    console.log(new Error(err?.message ?? err));
                })
                .finally(() => {
                    setFinished(true);
                });
        }
    }, [loaded]);

    return (
        <AuthContext.Provider value={{ finished, user, setUser, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
}