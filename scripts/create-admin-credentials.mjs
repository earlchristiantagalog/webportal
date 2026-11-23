import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY || !process.stdin.setRawMode) {
  console.error("Run this script in an interactive terminal so the password can be entered without echoing it.");
  process.exit(1);
}

process.stdout.write("Choose an admin password (at least 12 characters): ");
process.stdin.setRawMode(true);
process.stdin.resume();
let password = "";

process.stdin.on("data", (chunk) => {
  for (const character of chunk.toString("utf8")) {
    if (character === "\u0003") {
      process.stdin.setRawMode(false);
      process.stdout.write("\n");
      process.exit(1);
    }
    if (character === "\r" || character === "\n") {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (password.length < 12 || password.length > 1024) {
        console.error("Password must be between 12 and 1024 characters. No values were generated.");
        process.exitCode = 1;
        return;
      }
      const salt = randomBytes(16);
      const hash = scryptSync(password, salt, 64);
      password = "";
      console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
      console.log(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
      return;
    }
    if (character === "\u007f" || character === "\b") {
      if (password) {
        password = password.slice(0, -1);
        process.stdout.write("\b \b");
      }
    } else if (character >= " " && password.length < 1024) {
      password += character;
      process.stdout.write("*");
    }
  }
});
