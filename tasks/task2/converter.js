import fs from "fs";
import path from "path";
import { fork } from "child_process";
import os from "os";

const directoryPath = process.argv[2];
console.log(directoryPath)

if (!directoryPath) {
    console.error("No such directory!");
    process.exit();
}

fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
      process.exit();
    }
  
    const csvFiles = files.filter(file => path.extname(file).toLowerCase() === ".csv");
    console.log(csvFiles)
  
    if (csvFiles.length === 0) {
      console.error("No CSV files!");
      process.exit();
    }
  
    const fileCount = csvFiles.length;
    let totalRecordCount = 0;
    let startTime = new Date();
  
    
    const numWorkers = Math.min(fileCount, os.cpus().length);
    const recordsPerWorker = Math.ceil(fileCount / numWorkers);
  
    const workers = [];
  
    for (let i = 0; i < numWorkers; i++) {
      const start = i * recordsPerWorker;
      const end = start + recordsPerWorker;
      const worker = fork("tasks/task2/worker.js");
  
      worker.send({ directoryPath, csvFiles: csvFiles.slice(start, end) });
  
      worker.on("message", (message) => {
        totalRecordCount += message.recordCount;
        if (totalRecordCount === fileCount) {
          const endTime = new Date();
          const duration = endTime - startTime;
          console.log(`Total record count: ${totalRecordCount}. Duration: ${duration}ms`);
        }
      });
  
      worker.on("error", (err) => {
        console.error(err);
      });
  
      workers.push(worker);
    }
  });