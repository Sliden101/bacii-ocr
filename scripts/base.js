import { createWorker, createScheduler } from "tesseract.js";
const scheduler = createScheduler();

// Creates worker and adds to scheduler
const workerGen = async () => {
  const worker = await createWorker({cachePath: "."});
  await worker.loadLanguage('khm');
  await worker.initialize('khm');
  scheduler.addWorker(worker);
}

async function ocr(imgLink, workerN){
  const resArr = Array(workerN);
  for (let i=0; i<workerN; i++) {
    resArr[i] = await workerGen();
  }
  await Promise.all(resArr);

  /** Add workerN recognition jobs */
  const results = await Promise.all(Array(1).fill(0).map(() => (
    scheduler.addJob('recognize', imgLink).then((x) => console.log(x.data.text))
  )))

  await scheduler.terminate(); // It also terminates all workers.
}

ocr('https://raw.githubusercontent.com/Sliden101/bacii/master/his/his-001.png', 10)