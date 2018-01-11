const download = require('download');
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
        return download(url, destFolder, {filename: filename});
    }
};

module.exports = Util;