import fs from "fs";
import path from "path";
import csv from "csv-parser";

const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error("Error!");
  process.exit();
}


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

  const fileCount = csvFiles.length;
  let totalRecordCount = 0;
  let startTime = new Date();

  csvFiles.forEach((csvFile, index) => {
    const csvFilePath = path.join(directoryPath, csvFile);
    const jsonFilePath = path.join("tasks/task2/converted", `${path.parse(csvFile).name}.json`);

    let recordCount = 0;
    const records = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => {
        records.push(data);
        recordCount++;
      })
      .on('end', () => {
        fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
          if (err) {
            console.error(err);
          }
        });

        totalRecordCount += recordCount;

        if (index === fileCount - 1) {
          const endTime = new Date();
          const duration = endTime - startTime;
          console.log(`Total record count: ${totalRecordCount}. Duration: ${duration}ms`);
        }
      });
  });
});