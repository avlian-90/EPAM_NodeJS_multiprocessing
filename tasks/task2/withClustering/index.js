import fs from "fs";
import path from "path";
import { fork } from "child_process";
import os from "os";

function converter(directoryPath) {

  return new Promise((resolve, reject) => {

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
  
      const csvFiles = files.filter(file => path.extname(file).toLowerCase() === ".csv");
  
      if (csvFiles.length === 0) {
        console.error("No CSV files!");
        reject(new Error("No CSV files!"));
        return;
      }
  
      const filesCount = csvFiles.length;
      let startTime = new Date();
  
  
      const workersCount = Math.min(filesCount, os.cpus().length);
      const recordsPerWorker = Math.ceil(filesCount / workersCount);
  
      let completedWorkers = 0;
      let overallDuration = 0;
      let ovearallRecordCount = 0;
  
      for (let i = 0; i < workersCount; i++) {

        const start = i * recordsPerWorker;
        const end = start + recordsPerWorker;
        const worker = fork("tasks/task2/withClustering/worker.js");
  
        worker.send({ directoryPath, csvFiles: csvFiles.slice(start, end) });
  
        worker.on("message", (message) => {

          const endTime = new Date();
          const duration = endTime - startTime;
          overallDuration += duration;
          ovearallRecordCount += message.recordCount;
           

          completedWorkers ++;

          if (completedWorkers === workersCount) {
              console.log(`Total record count: ${ovearallRecordCount}. Duration: ${overallDuration}ms`); 
              resolve();
          }
        });
  
        worker.on("error", (err) => {
          console.error(err);
          reject(err);
        });
      }
  });
  })
}

const directoryPath = process.argv[2];

if (!directoryPath) {
    console.error("No such directory!");
    process.exit();
}

converter(directoryPath)
  .then(() => {
    console.log("Success!");
    process.exit();
  })
  .catch((err) => {
    console.err("Failed!", err);
    process.exit();
  })

