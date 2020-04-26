const express = require("express");
const process = require("child_process");
const fs = require("fs");
const {promisify} = require("util");
const archiver = require('archiver');
const uuidv1 = require("uuid").v1;
const rimraf = promisify(require("rimraf"));

const PORT = 80;
const SINGLEFILE = "/SingleFile/cli/single-file";
const CHROME = "/usr/bin/google-chrome-stable";
const DOWNLOADS_DIR = `${__dirname}/downloads/`;

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream);
        stream.on('close', () => resolve());
        archive.finalize();
    });
}

let app = express();

if(!fs.existsSync(DOWNLOADS_DIR)){
    fs.mkdirSync(DOWNLOADS_DIR);
};

app.get("/download",async (req,res)=>{
    if(!req.query.url){
        res.status(400).send("");
    } else{
        try{
            let { url } = req.query;
            let downloadCmd = `${SINGLEFILE} --browser-executable-path ${CHROME} --browser-args [\\\"--no-sandbox\\\"] ${url}`;
            // let downloadCmd = `echo ${url} >> 12333`;
            let downloadId = uuidv1();
            let pwd = `${DOWNLOADS_DIR}${downloadId}/`;
            let tempFile = `${DOWNLOADS_DIR}${downloadId}.zip`;
            fs.mkdirSync(pwd);
            let result = await promisify(process.exec)(downloadCmd,{cwd:pwd});
            console.log(result);
            await zipDirectory(pwd, tempFile);
            await rimraf(pwd);
            res.download(tempFile, err => {
                if (err) console.error(err);
                fs.unlinkSync(tempFile);
            });
        } catch(e){
            res.status(500).send(e+"");
        }
    }
});

app.listen(PORT,()=>{
    console.log(`Listen on ${PORT}!!`);
});
