/// <reference types="node" />
export interface UploadOptions {
    host?: string;
    complete?: Function;
    chunkComplate?: Function;
    error?: Function;
}
declare class BilibiliUploader {
    uploadToken: string;
    __ak: string;
    __bucket: string;
    chunkSize: number;
    chunkCount: number;
    nowChunk: number;
    fileSize: number;
    isInited: boolean;
    /**
     *
     * @param {string} uploadToken 上传凭证
     */
    constructor(uploadToken: string);
    upload(path: string, options?: UploadOptions): void;
    /**
     * mkblk
     * @param {string} host
     * @param {Buffer} buffer
     * @param {number} blockSize
     * @returns {Promise<any>}
     */
    makeBlock(host: string, buffer: Buffer, blockSize: number): Promise<{}>;
    /**
     * 整合文件
     * @param host
     * @param ctxs
     */
    makeFile(host: string, ctxs: string[]): Promise<{}>;
}
export default BilibiliUploader;
