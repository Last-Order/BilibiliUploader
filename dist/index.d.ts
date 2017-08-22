/// <reference types="node" />
export interface UploadOptions {
    complete?: Function;
    chunkComplate?: Function;
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
     * @param {Buffer} buffer
     * @param {number} blockSize
     * @returns {Promise<any>}
     */
    makeBlock(buffer: Buffer, blockSize: number): Promise<{}>;
    makeFile(ctxs: string[]): Promise<{}>;
}
export default BilibiliUploader;
