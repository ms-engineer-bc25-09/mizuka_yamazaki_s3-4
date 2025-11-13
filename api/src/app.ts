import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import userRouter from "./router/user";
import recordsRouter from "./router/records";
import morgan from "morgan";
import logger from "./context/logger";
import cors from "cors";

const app = express();
const port = 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// JSON形式のリクエストを扱えるように
app.use(express.json());

// === HTTPアクセスログ（morgan → winston） ===
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// ルーター設定
app.use("/user", userRouter);
app.use("/records", recordsRouter);

// ルート確認用
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

/* ===============================
   共通エラーハンドリング部分
   =============================== */

// ❌ 存在しないURLにアクセスした場合（404）
app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Record not found" });
});

// ❌ サーバー内部エラー（500）
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(
      `500 Error: ${req.method} ${req.url} - ${err.message}`,
      { stack: err.stack }
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

export default app;
