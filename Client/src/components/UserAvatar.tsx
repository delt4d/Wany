import { useEffect, useState } from "react"
import { useAuth } from "@contexts/auth";
import { bufferToUrlObject } from "@helpers/blob-convertions";

const UserAvatar = (props: any) => {
    const { user } = useAuth();
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        if (!user.avatar) setAvatar(null);
        else setAvatar(bufferToUrlObject(user.avatar.data));
    }, [user]);

    return <img {...props} src={avatar ?? "https://picsum.photos/250?random=1"} />
}

export default UserAvatar;