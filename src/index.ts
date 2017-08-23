import {ReadStream} from "fs";

const fs = require("fs");
const request = require("request");

export interface UploadOptions{
    host?: string,
    complete?: Function, // 完成时回调
    chunkComplate?: Function, // 分块上传时每块完成时回调
    error?: Function
}

class BilibiliUploader {
    uploadToken: string; // 上传凭证
    __ak: string = "MYqzXnGLWp0v7so0hgtj6WCk0gnqSoe4MzqHe5Gk";
    __bucket: string = "bvcupcdn-hd";
    chunkSize: number = 1024 * 1024 * 4; // 4M
    chunkCount: number = 0;
    nowChunk: number = 0;
    fileSize: number = 0;
    isInited: boolean = false;

    /**
     *
     * @param {string} uploadToken 上传凭证
     */
    constructor(uploadToken: string) {
        this.uploadToken = uploadToken;
        this.isInited = true;
    }
    upload(path: string, options: UploadOptions = {}) {
        this.fileSize = fs.statSync(path).size;
        this.chunkCount = Math.ceil(this.fileSize / this.chunkSize);
        let fileStream: ReadStream = fs.createReadStream(path);
        let readBuffers: Buffer[] = [];
        let readLength: number = 0;
        let totalReadLength: number = 0;
        let ctxs: string[] = [];

        console.log(`文件大小 ${this.fileSize} 分块数量 ${this.chunkCount} 上传开·始·了·哟`);
        fileStream.on('data', async (chunk) => {

            readBuffers.push(chunk);
            readLength += chunk.length;
            totalReadLength += chunk.length;

            if (readLength >= this.chunkSize || totalReadLength === this.fileSize){
                try{
                    this.nowChunk++;
                    console.log(`正在上传第 ${this.nowChunk}/${this.chunkCount} 分块 `);
                    fileStream.pause();
                    let response: any = await this.makeBlock(options.host || "upload.qbox.me", Buffer.concat(readBuffers), readLength);
                    ctxs.push(JSON.parse(response).ctx);
                    if (options.chunkComplate){
                        options.chunkComplate({
                            finishedChunks: this.nowChunk,
                            totalChunks: this.chunkCount
                        })
                    }
                    fileStream.resume();
                    readLength = 0;
                    readBuffers = [];
                    if (totalReadLength === this.fileSize){
                        try{
                            console.log("正发送整合指令");
                            await this.makeFile(options.host || "upload.qbox.me", ctxs);
                            if (options.complete){
                                options.complete();
                            }
                            console.log("上传完成");
                        }
                        catch (e){
                            console.error("整合文件出错");
                            console.log(e);
                            if (options.error){
                                options.error(e);
                            }
                        }
                    }
                }
                catch (e){
                    console.error(`上传第 ${this.nowChunk} 时错误!`);
                    console.log(e);
                    if (options.error){
                        options.error(e);
                    }
                }
            }
        })
    }

    /**
     * mkblk
     * @param {string} host
     * @param {Buffer} buffer
     * @param {number} blockSize
     * @returns {Promise<any>}
     */
    makeBlock(host: string, buffer: Buffer, blockSize: number){
        return new Promise(async (resolve, reject) => {
            let url = `http://${host}/mkblk/${blockSize}`;
            request({
                url: url,
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Length": blockSize,
                    "Authorization": `UpToken ${this.uploadToken}`
                },
                method: "POST",
                body: buffer
            }, (error, response, responseBody) => {
                if (error){
                    reject(error);
                }
                else{
                    resolve(responseBody);
                }
            })
        })
    }
    /**
     * 整合文件
     * @param host 
     * @param ctxs 
     */
    makeFile(host: string, ctxs: string[]){
        return new Promise(async (resolve, reject) => {
            request({
                url: `http://${host}/mkfile/${this.fileSize}`,
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": ctxs.join(',').length,
                    "Authorization": `UpToken ${this.uploadToken}`
                },
                method: "POST",
                body: ctxs.join(",")
            }, (error, response, responseBody) => {
                if (error){
                    reject(error);
                }
                else{
                    resolve(responseBody);
                }
            })
        })
    }
}

export default BilibiliUploader;