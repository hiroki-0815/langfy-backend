import request from "supertest";
import { spawn } from "child_process";
import path from "path";

describe("Main Module Execution", () => {
  it("should start the server and respond to /health when executed as main", (done) => {
    const indexPath = path.join(__dirname, "../dist/index.js");

    const child = spawn("node", [indexPath], {
      env: { ...process.env, PORT: "7001" },
      stdio: "ignore", 
    });

    const healthUrl = "http://localhost:7001/health";
    const startTime = Date.now();
    const timeout = 10000; 

    const pollHealth = () => {
      request(healthUrl)
        .get("")
        .then((res) => {
          if (res.status === 200) {
            child.kill();
            done();
          } else if (Date.now() - startTime > timeout) {
            child.kill();
            done(new Error("Timed out waiting for /health to respond with 200"));
          } else {
            setTimeout(pollHealth, 100);
          }
        })
        .catch(() => {
          if (Date.now() - startTime > timeout) {
            child.kill();
            done(new Error("Timed out waiting for /health to respond with 200"));
          } else {
            setTimeout(pollHealth, 100);
          }
        });
    };

    pollHealth();
  }, 15000);
});