import { createWorker, createScheduler } from "tesseract.js";
import fs from 'fs';

const scheduler = createScheduler();

// Creates worker and adds to scheduler
const workerGen = async () => {
  const worker = await createWorker({cachePath: "."});
  await worker.loadLanguage('khm');
  await worker.initialize('khm');
  scheduler.addWorker(worker);
}

let links = [];
for (let i = 1; i < 79; i++){
  let str = "" + i;
  let pad = "00";
  let num = pad.substring(0, pad.length - str.length) + str;
  links.push(`https://raw.githubusercontent.com/Sliden101/bacii/master/kh/kh-${num}.png`);
}

async function ocr(){
  let workerN = 2;
  const resArr = Array(workerN);
  for (let i=0; i<workerN; i++) {
    resArr[i] = await workerGen();
  }
  await Promise.all(resArr);

  let writeObj = {
    data: []
  };
  for (let i=0;i<links.length;i++) {
    try {
      const results = await Promise.all(Array(1).fill(0).map(() => (
        scheduler.addJob('recognize', links[i])
        .then((x) =>
        writeObj.data.push({text: x.data.text})
        ))));
        console.log(`Written ${i} to obj`)
    } catch (err) {
      console.error(err);
    }
  }
  let writeObjJSON = JSON.stringify(writeObj);
  fs.writeFileSync(`./kh/kh.json`, writeObjJSON, 'utf-8');
  console.log(`Written to file`)

  await scheduler.terminate();
}

let w = await ocr();