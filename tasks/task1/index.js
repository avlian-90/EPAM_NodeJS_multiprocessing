import fs from "fs";
import path from "path";
import { spawn } from "child_process";

function getStatistics(command, commandArgs = [], timeout = Infinity) {

    const start = new Date();
   
    const timestamp = start.getTime();

    // I couldn't understand why it didn't work when I wrote:
    // const timestamp = start.toISOString();
    // but with getTime() it worked.
    // I spent four hours finding the problem, when with toISOString it wasn't working.

    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, commandArgs);

        let commandSuccess = true;

        childProcess.on("error", (error) => {
            commandSuccess = false;
            reject(error);
        });

        childProcess.on("exit", (code, signal) => {
            const end = new Date();
            const duration = end - start;
            const success = code === 0 && commandSuccess;
            const error = code !== 0 && signal !== null ? `Error: Process terminated with sigllnal ${signal}` : "No error!";
            

            const statistics = {
                start: start.toISOString(),
                duration,
                success,
                error
            }

            const content = JSON.stringify(statistics, null, 2);

            if (!success) {
                statistics.commandSuccess = commandSuccess;
            }

            const fileName = `${timestamp}${command}.json`;
           
            const filePath = path.join('logs', fileName);
            
           
            fs.writeFile(filePath, content, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(statistics);
                }
            });
        });

        if (timeout !== Infinity) {
            setTimeout(() => {
                childProcess.kill();
            }, timeout);
        }
    });
}

getStatistics("ls", ["-l"])
    .then((res) => {
        console.log("Statistics: ", res);
    })
    .catch((error) => {
        console.error("Error: ", error);
    })





