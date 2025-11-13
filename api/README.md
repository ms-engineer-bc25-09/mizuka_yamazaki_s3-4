# 家計簿API 仕様書

---

##  概要
本APIは、家計簿アプリケーションにおける収支データ（レコード）の  
**取得・登録・更新・削除（CRUD）** を行うためのRESTful APIである。

| 項目 | 内容 |
|------|------|
| ベースURL | `http://localhost:4000` |
| データ形式 | JSON |
| 認証 | なし（ローカル開発用） |
| 対象リソース | `records`（家計簿の記録） |

---

##  データモデル

| フィールド名 | 型 | 必須 | 説明 |
|---------------|----|------|------|
| `id` | number | 自動 | レコードID（ユニーク） |
| `date` | string (YYYY-MM-DD) | カレンダーチェック | 日付 |
| `category` | string | プルダウン | カテゴリ（食費・家賃・給料など） |
| `details` | string | 任意 | 明細・店名など |
| `inAmount` | number | 任意 | 収入金額 |
| `outAmount` | number | 任意 | 支出金額 |
| `memo` | string | 任意 | 備考メモ |

---

##  エンドポイント一覧

| メソッド | エンドポイント | 概要 | 主な処理内容 |
|-----------|----------------|------|---------------|
| GET | `/records` | レコード一覧取得 | すべての家計簿データを取得 |
| GET | `/records/{id}` | 個別レコード取得 | 指定IDのレコードを取得 |
| POST | `/records` | レコード登録 | 新しい家計簿データを追加 |
| PUT | `/records/{id}` | レコード更新 | 指定レコードの内容を更新 |
| DELETE | `/records/{id}` | レコード削除 | 指定レコードを削除 |

---

##  各API詳細

### ★ GET `/records`
| 項目 | 内容 |
|------|------|
| 機能 | 家計簿レコード一覧の取得 |
| パラメータ | `month`（任意、YYYY-MM）指定で月別絞り込み可能 |
| レスポンス例 |
```json
[
  {
    "id": 1,
    "date": "2025-10-02",
    "category": "家賃",
    "details": "家賃",
    "inAmount": 0,
    "outAmount": 100000,
    "memo": "2025年9月分の家賃を振込み忘れたため、振り込んだ"
  },
  {
    "id": 2,
    "date": "2025-10-01",
    "category": "給料",
    "details": "給料振込",
    "inAmount": 300000,
    "outAmount": 0,
    "memo": ""
  }
]
🔹 GET /records/{id}
項目	内容
機能	指定IDの家計簿レコードを取得
例	/records/3
レスポンス例	

json
コードをコピーする
{
  "id": 3,
  "date": "2025-09-30",
  "category": "食費",
  "details": "飲み会代",
  "inAmount": 0,
  "outAmount": 15000,
  "memo": "高校の同級生と飲み会"
}
🔹 POST /records
項目	内容
機能	家計簿レコードを新規登録
Content-Type	application/json
リクエスト例	

json
コードをコピーする
{
  "date": "2025-10-30",
  "category": "食費",
  "details": "スーパー",
  "inAmount": 0,
  "outAmount": 2500,
  "memo": "夕飯の買い出し"
}
| レスポンス例 |

json
コードをコピーする
{
  "message": "Record created",
  "record": {
    "id": 5,
    "date": "2025-10-30",
    "category": "食費",
    "details": "スーパー",
    "inAmount": 0,
    "outAmount": 2500,
    "memo": "夕飯の買い出し"
  }
}
🔹 PUT /records/{id}
項目	内容
機能	既存レコードの更新
Content-Type	application/json
リクエスト例	

json
コードをコピーする
{
  "memo": "夕飯と朝食分をまとめ買いに変更"
}
| レスポンス例 |

json
コードをコピーする
{
  "message": "Record updated"
}
🔹 DELETE /records/{id}
項目	内容
機能	指定レコードの削除
例	/records/4
レスポンス例	

json
コードをコピーする
{
  "message": "Record deleted"
}
⚠️ エラーレスポンス共通
ステータス	説明	レスポンス例
400	不正なリクエスト	{"error": "Bad Request"}
404	データが存在しない	{"error": "Record not found"}
500	サーバー内部エラー	{"error": "Internal Server Error"}

✅ バリデーションルール
項目	条件
date	必須、YYYY-MM-DD 形式
category	必須
inAmount と outAmount	どちらか片方のみ0より大きい値を取る
両方0または両方指定	エラー扱い

📘 補足
月別・カテゴリ別フィルタリングを追加予定

永続化は data.json または MySQL などのDBを使用予定

yaml
コードをコピーする
