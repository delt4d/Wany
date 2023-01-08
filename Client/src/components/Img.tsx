type ImgProps = {
    id?: string
    src?: string
    url?: string
    className?: string
    alt?: string
}

import Image from "next/image"

export default (props: ImgProps) => {
    const url = props.url || props.src;
    return <Image id={props.id} src={url ?? ""} className={props.className} alt={props.alt}></Image>
}