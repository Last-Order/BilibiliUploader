/// <reference types="node" />
declare class BilibiliUploader {
    uploadToken: string;
    key: string;
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
    upload(path: string, key: string): void;
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
