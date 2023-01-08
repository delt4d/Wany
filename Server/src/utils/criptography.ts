import crypto from "crypto";

export class Criptography {
    static generateUUIDV4() {
        return crypto.randomBytes(16).toString('hex');
    }
    static generateMD5(value: any) {
        return crypto.createHash('md5').update(value).digest('hex');
    }
}