import fs from "fs";
import path from "path";
import csv from "csv-parser";

function converter() {

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error(err);
          process.exit();
        }
      
        const csvFiles = files.filter(file => path.extname(file).toLowerCase() === ".csv");
      
        if (csvFiles.length === 0) {
          console.error("No CSV files!");
          process.exit(1);
        }
      
        const filesCount = csvFiles.length;
        let startTime = new Date();
      
        csvFiles.forEach((csvFile, index) => {
          const csvFilePath = path.join(directoryPath, csvFile);
          const jsonFilePath = path.join("tasks/task2/converted", `${path.parse(csvFile).name}.json`);
      
          let recordsCount = 0;
          const records = [];
          let duration = 0;
      
          fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (data) => {
              records.push(data);
              recordsCount++;
            })
            .on('end', () => {
              fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
                if (err) {
                  console.error(err);
                }
              });
      
              if (index === filesCount - 1) {
                const endTime = new Date();
                duration = endTime - startTime;
              }
              console.log(`Total record count: ${recordsCount}. Duration: ${duration}ms`);
            });
        });
    });
}

const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error("Error!");
  process.exit();
}

converter(directoryPath);


