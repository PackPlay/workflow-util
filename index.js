const download = require('download');
const fs = require('fs');
const path = require('path');

class Util {
    static checkSWFEnv() {
        Util.hasEnv('SWF_DOMAIN');
        Util.hasEnv('SWF_TASKLIST');
    }
    static checkS3Env() {
        Util.hasEnv('S3_BUCKET');
        Util.hasEnv('S3_FOLDER');
    }

    static hasEnv(name) {
        if(!process.env[name]) {
            throw new Error(`${name} not found`);
        }
        if(process.env[name].length <= 0) {
            throw new Error(`${name} not found`);
        }
        return true;
    }

    /**
     * Get file
     * @param {string} url 
     * @param {string} destFolder
     * @param {string} filename (optional)
     * @returns {Promise<Buffer>}
     */
    static getFile(url, destFolder, filename) {
        let name = filename || path.basename(url);
        return download(url, destFolder, {filename: filename})
            .then(buffer => path.join(destFolder, name));
    }

    static getFileOrCache(url, destFolder, filename) {
        let p = new Promise((res, rej) => {
            let name = filename || path.basename(url);
            fs.exists(path.join(destFolder, name), (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data); 
            });
        });

        return p.then(exist => {
            if(!exist) {
                return Util.getFile(url, destFolder, filename);
            }
            return path.join(destFolder, name);
        });
    }

    /**
     * Put file to s3 and wrap into promise
     * @param {*Object} s3 s3 instance from aws-sdk pack
     * @param {*Object} params params for putObject
     */
    static putFile(s3, params) {
        return new Promise((res, rej) => {
            s3.putObject(params, (err, data) => {
                if(err) {
                    return rej(err);
                }
                return res(data);
            });
        });
    }
};

module.exports = Util;