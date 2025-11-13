// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // いったん全部クリア（何度実行しても同じ状態にしたいので）
  await prisma.records.deleteMany();

  await prisma.records.createMany({
    data: [
      {
        date: new Date("2025-09-30"),
        category: "給料",
        details: "9月分の給与",
        inAmount: 300000,
        outAmount: null,
        memo: "",
      },
      {
        date: new Date("2025-10-02"),
        category: "食費",
        details: "スーパーで買い物",
        inAmount: null,
        outAmount: 1800,
        memo: "夕飯の材料",
      },
      {
        date: new Date("2025-10-05"),
        category: "日用品",
        details: "ドラッグストア",
        inAmount: null,
        outAmount: 1200,
        memo: "トイレットペーパーなど",
      },
      {
        date: new Date("2025-10-08"),
        category: "交際費",
        details: "友人とランチ",
        inAmount: null,
        outAmount: 2300,
        memo: "",
      },
      {
        date: new Date("2025-10-10"),
        category: "その他収入",
        details: "フリマアプリ売上",
        inAmount: 4500,
        outAmount: null,
        memo: "服3点",
      },
    ],
  });

  console.log("✅ Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
