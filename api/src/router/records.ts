// src/router/records.ts
import { Router } from "express";
import { PrismaClient } from "../generated/prisma";

const router = Router();
const prisma = new PrismaClient();

/** フロントから飛んでくる値を Prisma 用に整形する */
function toPrismaData(body: any) {
  return {
    // "2025-10-02" みたいな文字列を Date 型に変換
    date: body.date ? new Date(body.date) : new Date(),
    category: body.category,
    details: body.details ?? null,
    inAmount:
      body.inAmount === "" || body.inAmount == null
        ? null
        : Number(body.inAmount),
    outAmount:
      body.outAmount === "" || body.outAmount == null
        ? null
        : Number(body.outAmount),
    memo: body.memo ?? null,
  };
}

// 1. 一覧取得 (GET /records)
router.get("/", async (req, res) => {
  try {
    const records = await prisma.records.findMany({
      orderBy: { date: "desc" },
    });
    res.json(records);
  } catch (err) {
    console.error("GET /records でエラー:", err);
    res.status(500).json({ error: "データの読み込みに失敗しました" });
  }
});

// 2. 個別取得 (GET /records/:id)
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = await prisma.records.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(record);
  } catch (err) {
    console.error("GET /records/:id でエラー:", err);
    res.status(500).json({ error: "データの取得に失敗しました" });
  }
});

// 3. 新規登録 (POST /records)
router.post("/", async (req, res) => {
  try {
    const data = toPrismaData(req.body);

    const newRecord = await prisma.records.create({
      data,
    });

    res.status(201).json(newRecord);
  } catch (err) {
    console.error("POST /records でエラー:", err);
    res.status(500).json({ error: "データの保存に失敗しました" });
  }
});

// 4. 更新 (PUT /records/:id)
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = toPrismaData(req.body);

    await prisma.records.update({
      where: { id },
      data,
    });

    res.json({ message: "Record updated" });
  } catch (err: any) {
    console.error("PUT /records/:id でエラー:", err);
    // レコードが存在しないとき用の簡易対応
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(500).json({ error: "データの更新に失敗しました" });
  }
});

// 5. 削除 (DELETE /records/:id)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.records.delete({
      where: { id },
    });

    res.json({ message: "Record deleted" });
  } catch (err: any) {
    console.error("DELETE /records/:id でエラー:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(500).json({ error: "データの削除に失敗しました" });
  }
});

export default router;
