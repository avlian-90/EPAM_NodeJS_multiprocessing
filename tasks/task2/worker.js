import fs from "fs";
import path from "path";
import csv from "csv-parser";

process.on("message", ({ directoryPath, csvFiles }) => {
  csvFiles.forEach((csvFile) => {
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
      .on("end", () => {
        fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
          }
        });

        process.send({ recordCount });
      });
  });
});
