"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
class BilibiliUploader {
    /**
     *
     * @param {string} uploadToken 上传凭证
     */
    constructor(uploadToken) {
        this.__ak = "MYqzXnGLWp0v7so0hgtj6WCk0gnqSoe4MzqHe5Gk";
        this.__bucket = "bvcupcdn-hd";
        this.chunkSize = 1024 * 1024 * 4; // 4M
        this.chunkCount = 0;
        this.nowChunk = 0;
        this.fileSize = 0;
        this.isInited = false;
        this.uploadToken = uploadToken;
        this.isInited = true;
    }
    upload(path, key) {
        this.key = key;
        this.fileSize = fs.statSync(path).size;
        this.chunkCount = Math.ceil(this.fileSize / this.chunkSize);
        let fileStream = fs.createReadStream(path);
        let readBuffers = [];
        let readLength = 0;
        let totalReadLength = 0;
        let ctxs = [];
        console.log(`文件大小 ${this.fileSize} 分块数量 ${this.chunkCount} 上传开·始·了·哟`);
        fileStream.on('data', (chunk) => __awaiter(this, void 0, void 0, function* () {
            readBuffers.push(chunk);
            readLength += chunk.length;
            totalReadLength += chunk.length;
            if (readLength >= this.chunkSize || totalReadLength === this.fileSize) {
                try {
                    this.nowChunk++;
                    console.log(`正在上传第 ${this.nowChunk}/${this.chunkCount} 分块 `);
                    fileStream.pause();
                    let response = yield this.makeBlock(Buffer.concat(readBuffers), readLength);
                    ctxs.push(JSON.parse(response).ctx);
                    fileStream.resume();
                    readLength = 0;
                    readBuffers = [];
                    if (totalReadLength === this.fileSize) {
                        try {
                            console.log("正发送整合指令");
                            yield this.makeFile(ctxs);
                            console.log("上传完成");
                        }
                        catch (e) {
                            console.error("整合文件出错");
                            console.log(e);
                        }
                    }
                }
                catch (e) {
                    console.error(`上传第 ${this.nowChunk} 时错误!`);
                    console.log(e);
                }
            }
        }));
    }
    /**
     * mkblk
     * @param {Buffer} buffer
     * @param {number} blockSize
     * @returns {Promise<any>}
     */
    makeBlock(buffer, blockSize) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let url = `https://upload.qbox.me/mkblk/${blockSize}`;
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
                if (error) {
                    reject(error);
                }
                else {
                    resolve(responseBody);
                }
            });
        }));
    }
    makeFile(ctxs) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            request({
                url: `https://upload.qbox.me/mkfile/${this.fileSize}`,
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": ctxs.join(',').length,
                    "Authorization": `UpToken ${this.uploadToken}`
                },
                method: "POST",
                body: ctxs.join(",")
            }, (error, response, responseBody) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(responseBody);
                }
            });
        }));
    }
}
exports.default = BilibiliUploader;
//# sourceMappingURL=index.js.map