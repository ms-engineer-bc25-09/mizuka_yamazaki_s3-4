import winston from "winston";
import fs from "fs";
import path from "path";

// logs フォルダを自動で作る（なければ作る）
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    // コンソール表示
    new winston.transports.Console({ level: "info" }),

    // アクセスログ（morgan がここに書き込む）
    new winston.transports.File({
      filename: path.join(logDir, "access.log"),
      level: "info",
    }),

    // エラーログ（app.tsの500エラーとか）
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // デバッグログ（必要なら）
    new winston.transports.File({
      filename: path.join(logDir, "debug.log"),
      level: "debug",
    }),
  ],
});

export default logger;
