import { Router } from "express";

const router = Router();

// 仮の家計簿データ（あとでDB接続する前提でもOK）
const records = [
  {
    date: "2025-10-02",
    category: "食費",
    details: "スーパーで買い物",
    inAmount: "",
    outAmount: 1800,
    memo: "夕飯の材料",
  },
  {
    date: "2025-09-30",
    category: "給料",
    details: "9月分の給与",
    inAmount: 300000,
    outAmount: "",
    memo: "",
  },
];

// GET /user → 家計簿データを返す
router.get("/", (req, res) => {
  res.json(records);
});

export default router;
