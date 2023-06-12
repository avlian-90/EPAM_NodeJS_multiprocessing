import fs from "fs";
import path from "path";
import { fork } from "child_process";
import os from "os";

function converter(directoryPath) {

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error(err);
          process.exit();
        }
    
        const csvFiles = files.filter(file => path.extname(file).toLowerCase() === ".csv");
    
        if (csvFiles.length === 0) {
          console.error("No CSV files!");
          process.exit();
        }
    
        const filesCount = csvFiles.length;
        let startTime = new Date();
    
    
        const workersCount = Math.min(filesCount, os.cpus().length);
        const recordsPerWorker = Math.ceil(filesCount / workersCount);
    
        let completedWorkers = 0;
    
        for (let i = 0; i < workersCount; i++) {

          const start = i * recordsPerWorker;
          const end = start + recordsPerWorker;
          const worker = fork("tasks/task2/withClustering/worker.js");
    
          worker.send({ directoryPath, csvFiles: csvFiles.slice(start, end) });
    
          worker.on("message", (message) => {

            const endTime = new Date();
            const duration = endTime - startTime;
            console.log(`Total record count: ${message.recordCount}. Duration: ${duration}ms`);  

            completedWorkers ++;

            if (completedWorkers === workersCount) {
                process.exit();
            }
          });
    
          worker.on("error", (err) => {
            console.error(err);
          });
        }
    });
}

const directoryPath = process.argv[2];

if (!directoryPath) {
    console.error("No such directory!");
    process.exit();
}

converter(directoryPath);

