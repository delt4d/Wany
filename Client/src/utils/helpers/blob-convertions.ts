export function toArrayBuffer(buf: Buffer): ArrayBuffer {
    // converts buffer to ArrayBuffer
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);

    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

export function bufferToBlob(buf: Buffer, type = "application/octet-stream"): Blob {
    const ab = toArrayBuffer(buf);
    const blob = new Blob([ab], { type });
    return blob;
}

export function bufferToUrlObject(buf: Buffer, type = "application/octet-stream") {
    try {
        return URL.createObjectURL(bufferToBlob(buf, type));
    }
    catch {
        return "";
    }
}