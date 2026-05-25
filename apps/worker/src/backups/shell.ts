import { spawn } from "node:child_process";

export async function runCommand(
  command: string,
  args: string[],
  options?: {
    env?: NodeJS.ProcessEnv;
    stdoutFile?: string;
    stdinFile?: string;
  }
) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      env: options?.env ?? process.env,
      stdio: [
        options?.stdinFile ? "pipe" : "ignore",
        options?.stdoutFile ? "pipe" : "pipe",
        "pipe"
      ]
    });

    let stdout = "";
    let stderr = "";

    if (options?.stdinFile && child.stdin) {
      import("node:fs").then(({ createReadStream }) => {
        const stream = createReadStream(options.stdinFile!);
        stream.pipe(child.stdin!);
        stream.on("error", reject);
      });
    }

    if (options?.stdoutFile && child.stdout) {
      import("node:fs").then(({ createWriteStream }) => {
        const out = createWriteStream(options.stdoutFile!);
        child.stdout!.pipe(out);
        out.on("error", reject);
      });
    } else {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString("utf8");
      });
    }

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}\n${stderr}\n${stdout}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}
