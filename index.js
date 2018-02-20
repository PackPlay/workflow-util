const _ = require('lodash');
const download = require('download');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const urljoin = require('url-join');
const {promisify} = require('util');

const readFile = promisify(fs.readFile);

class Util {
    static checkSWFEnv() {
        Util.hasEnv('SWF_DOMAIN');
        Util.hasEnv('SWF_TASKLIST');
    }
    static checkS3Env() {
        Util.hasEnv('S3_BUCKET');
        Util.hasEnv('S3_FOLDER');
    }

    static getTmpFolder() {
        return process.env.TMP_FOLDER || '/tmp/';
    }
    static getTmpName(source, hash=false) {
        let t = path.basename(source);
        if(hash) {
            t = md5(source) + path.extname(source);
        }
        return t;
    }
    static getOutputUrl(outputName) {
        return urljoin(process.env.AWS_CLOUDFRONT, outputName);
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
     * Read file and return promise
     * @param {*string} filePath path/to/file
     * @param {*Object} options fs.readFile option
     */
    static readFile(filePath, options) {
        return readFile(filePath, options);
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
        let headers = {};
        if(process.env.AWS_ACCESS_KEY_ID) {
            headers = {
                "Authorization": `AWS ${process.env.AWS_ACCESS_KEY_ID}:${process.env.AWS_SECRET_ACCESS_KEY}`
            };
        }
        return download(url, destFolder, {filename, headers})
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
    static putFile(s3, outputName, data, params={}) {
        params = _.extend({
            ACL: 'public-read',
            Body: data,
            Bucket: process.env.S3_BUCKET,
            Key: `${process.env.S3_FOLDER}/${outputName}`,
            ContentType: 'application/octet-stream'
        }, params);

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