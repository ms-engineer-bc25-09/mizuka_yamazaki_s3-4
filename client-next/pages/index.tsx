import { useEffect, useState } from "react";
import Record from "../components/Records";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "../icons";

/* ---------- 型定義 ---------- */
type Rec = {
  id?: number;
  date: string; // "YYYY-MM-DD"
  category: string;
  details?: string;
  inAmount?: number | "";
  outAmount?: number | "";
  memo?: string;
};

/* ---------- APIユーティリティ ---------- */
const API = "http://localhost:4000/records";

const fetchRecords = () =>
  fetch(API + "?ts=" + Date.now()) // キャッシュ回避
    .then((res) => res.json())
    .then((data: Rec[]) =>
      [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );

/* ---------- ページ本体 ---------- */
export default function Home() {
  const [recordsData, setRecordsData] = useState<Rec[]>([]);
  const [modal, setModal] = useState<
    | { index: number; mode: "view"; initial: null }
    | { index: number | null; mode: "edit"; initial: Rec }
  >({ index: -1, mode: "view", initial: null });
  const [currentMonth, setCurrentMonth] = useState<string>("");

  // 初回取得（新しい順にソート）
  useEffect(() => {
    fetchRecords()
      .then(setRecordsData)
      .catch((err) => console.error("取得に失敗しました", err));
  }, []);

  // ESC でモーダル閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 月一覧（基本は昇順 → 表示用に反転も用意）
  const monthOptionsDesc = Array.from(
    new Set(recordsData.map((r) => r.date?.slice(0, 7)).filter(Boolean))
  ).sort(); // 古い → 新しい

  const monthOptionsAsc = [...monthOptionsDesc].reverse(); // 新しい → 古い（表示用）

  // 初期表示（月は最新）
  useEffect(() => {
    if (!currentMonth && monthOptionsDesc.length)
      setCurrentMonth(monthOptionsDesc[monthOptionsDesc.length - 1]); // 一番新しい月
  }, [monthOptionsDesc, currentMonth]);

  // 表示対象
  const visible = recordsData
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => currentMonth && r.date?.startsWith(currentMonth));

  // 当月集計
  const totals = visible.reduce(
    (acc, x) => {
      acc.in += Number(x.r.inAmount || 0);
      acc.out += Number(x.r.outAmount || 0);
      return acc;
    },
    { in: 0, out: 0 }
  );
  const net = totals.in - totals.out;

  // 円表示
  const yen = (v: number | string) => {
    const n = Number(v || 0);
    return n ? `¥${n.toLocaleString()}` : "-";
  };

  // モーダル制御
  const openView = (index: number) =>
    setModal({ index, mode: "view", initial: null });
  const openEditExisting = (index: number) =>
    setModal({ index, mode: "edit", initial: recordsData[index] });
  const openEditNew = () =>
    setModal({
      index: null,
      mode: "edit",
      initial: {
        date: "",
        category: "",
        details: "",
        inAmount: "",
        outAmount: "",
        memo: "",
      },
    });
  const closeModal = () => setModal({ index: -1, mode: "view", initial: null });

  const openRecordIndex =
    modal.mode === "view" && modal.index >= 0 ? modal.index : null;
  const setOpenRecordIndex = (v: number | null) => {
    if (v === null) closeModal();
    else openView(v);
  };

  // 一覧アイコン
  const handleDelete = (index: number) => {
    if (window.confirm("このデータを削除しますか？")) {
      setRecordsData((prev) => prev.filter((_, i) => i !== index));
      closeModal();
    }
  };
  const handleEdit = (index: number) => openEditExisting(index);

  const r = openRecordIndex !== null ? recordsData[openRecordIndex] : null;

  // 月ナビ（右クリックで古い月に進む）
  const goPrevMonth = () => {
    const idx = monthOptionsAsc.indexOf(currentMonth);
    if (idx > 0) {
      // 左：新しいほうへ戻る
      setCurrentMonth(monthOptionsAsc[idx - 1]);
    }
  };
  const goNextMonth = () => {
    const idx = monthOptionsAsc.indexOf(currentMonth);
    if (idx >= 0 && idx < monthOptionsAsc.length - 1) {
      // 右：古いほうへ進む
      setCurrentMonth(monthOptionsAsc[idx + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100/20 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5">
          {/* ヘッダー：ロゴ＋月切り替え＋新規ボタン */}
          <div className="flex items-center justify-between gap-4">
            {/* 左：ロゴ（家マーク） */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path
                    d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-9.5z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-emerald-950">
                  家計簿
                </div>
                <div className="text-[10px] text-emerald-900/60">
                  Monthly household tracker
                </div>
              </div>
            </div>

            {/* 真ん中：月見出し（ナビ） */}
            <div className="flex items-center gap-3">
              <button
                className="p-1.5 rounded-lg text-emerald-800/80 hover:bg-rose-50 disabled:opacity-40"
                onClick={goPrevMonth}
                disabled={monthOptionsAsc.indexOf(currentMonth) <= 0}
                aria-label="新しい月"
                title="新しい月"
              >
                <FaChevronLeft size={18} />
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-base sm:text-lg font-semibold tracking-wide text-emerald-950">
                  {currentMonth || "---- --"}
                </span>
              </div>

              <button
                className="p-1.5 rounded-lg text-emerald-800/80 hover:bg-emerald-50 disabled:opacity-40"
                onClick={goNextMonth}
                disabled={
                  monthOptionsAsc.indexOf(currentMonth) ===
                  monthOptionsAsc.length - 1
                }
                aria-label="古い月"
                title="古い月"
              >
                <FaChevronRight size={18} />
              </button>
            </div>

            {/* 右：新規追加ボタン */}
            <button
              className="p-2 rounded-lg text-emerald-800 hover:bg-emerald-50"
              onClick={openEditNew}
              title="データの追加"
            >
              <FaPlus size={18} style={{ cursor: "pointer" }} />
            </button>
          </div>

          {/* 一覧＋月リスト 横並び（PC）／スマホは一覧のみ */}
          <div className="mt-5 flex gap-6">
            {/* 左：月リスト（スマホでは非表示） */}
            <div className="hidden md:block w-28 flex-shrink-0">
              <h3 className="text-xs font-semibold text-emerald-900">
                月リスト
              </h3>
              <ul className="mt-2 space-y-1">
                {monthOptionsAsc.map((m) => (
                  <li key={m}>
                    <button
                      className={`w-full inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset
                        ${
                          m === currentMonth
                            ? "bg-emerald-500 text-white ring-emerald-500"
                            : "bg-emerald-50 text-emerald-800 ring-emerald-200 hover:bg-emerald-100"
                        }`}
                      onClick={() => setCurrentMonth(m)}
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 右：その月の合計＋家計簿一覧（同じ幅のカラム） */}
            <div className="flex-1 flex flex-col gap-3">
              {/* 当月サマリ（テーブルと同じ幅の中に配置） */}
              <SummaryBar
                inTotal={totals.in}
                outTotal={totals.out}
                net={net}
                yen={yen}
              />

              {/* 一覧テーブル */}
              <div className="overflow-x-auto rounded-xl border border-emerald-100 shadow-sm">
                <table className="w-full table-fixed text-[11px] sm:text-sm md:text-base">
                  <thead className="bg-emerald-50 text-emerald-900">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-center">
                        日付
                      </th>
                      <th className="px-3 py-2 font-semibold text-center">
                        カテゴリ
                      </th>
                      <th className="px-3 py-2 font-semibold text-center">
                        入金
                      </th>
                      <th className="px-3 py-2 font-semibold text-center">
                        出金
                      </th>
                      <th className="px-3 py-2 font-semibold text-center">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr]:border-b [&>tr]:border-emerald-50 [&>tr:hover]:bg-emerald-50/70 [&>tr>td]:py-2">
                    {visible.map(({ r, i }) => (
                      <Record
                        key={i}
                        index={i}
                        date={r.date}
                        category={r.category}
                        details={r.details || ""}
                        inAmount={r.inAmount ?? ""}
                        outAmount={r.outAmount ?? ""}
                        memo={r.memo || ""}
                        openRecordIndex={openRecordIndex}
                        setOpenRecordIndex={setOpenRecordIndex}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ▼▼ モーダル（閲覧 / 編集） ▼▼ */}
          {(openRecordIndex !== null || modal.mode === "edit") && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-32"
              onClick={modal.mode === "edit" ? undefined : closeModal}
            >
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity" />
              <div
                className="relative bg-white rounded-2xl border border-emerald-100 shadow-lg w-full max-w-[420px] p-6 space-y-5 text-sm text-slate-800"
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                {/* 閲覧モード */}
                {modal.mode === "view" && r && (
                  <>
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => openEditExisting(openRecordIndex!)}
                        title="編集"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200"
                        onClick={closeModal}
                        title="閉じる"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-emerald-900 mt-9">
                      {r?.date}
                    </h3>

                    <div className="space-y-3">
                      <Item label="カテゴリ" value={r?.category} />
                      <Item label="詳細" value={r?.details || "-"} />
                      <Money label="入金" value={r?.inAmount ?? 0} yen={yen} />
                      <Money label="出金" value={r?.outAmount ?? 0} yen={yen} />
                      <Item
                        label="メモ"
                        value={r?.memo?.trim() ? r.memo : "-"}
                      />
                    </div>

                    <button
                      className="absolute right-6 bottom-6 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
                      onClick={() => handleDelete(openRecordIndex!)}
                      title="削除"
                    >
                      <FaTrash />
                    </button>

                    <BottomHandle />
                  </>
                )}

                {/* ★ 編集モード */}
                {modal.mode === "edit" && (
                  <EditForm
                    initial={modal.initial as Rec}
                    onCancel={closeModal}
                    onSave={async (updated) => {
                      try {
                        if (modal.index === null) {
                          // ★ 新規 → POST /records
                          const res = await fetch(API, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updated),
                          });
                          const saved: Rec = await res.json();

                          // サーバーを正として再取得
                          const next = await fetchRecords();
                          setRecordsData(next);

                          const newMonth = (saved.date || "").slice(0, 7);
                          if (newMonth) setCurrentMonth(newMonth);

                          closeModal();
                        } else {
                          // ★ 既存更新 → PUT /records/:id
                          const target = recordsData[modal.index!];
                          const id = target?.id;
                          if (!id) {
                            console.error("更新対象に id がありません");
                            return;
                          }

                          await fetch(`${API}/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updated),
                          });

                          // 最新データを再取得して反映
                          const next = await fetchRecords();
                          setRecordsData(next);

                          const updMonth = (updated.date || "").slice(0, 7);
                          if (updMonth) setCurrentMonth(updMonth);

                          openView(modal.index);
                        }
                      } catch (e) {
                        console.error("保存に失敗しました", e);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}
          {/* ▲▲ モーダルここまで ▲▲ */}
        </div>
      </div>
    </div>
  );

  function normalize(v: Rec): Rec {
    return {
      ...v,
      inAmount: v.inAmount === "" ? "" : Number(v.inAmount),
      outAmount: v.outAmount === "" ? "" : Number(v.outAmount),
    };
  }
}

/* ---------- 小パーツ ---------- */
function Item({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] text-emerald-900/60">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Money({
  label,
  value,
  yen,
}: {
  label: string;
  value: number | string;
  yen: (v: number | string) => string;
}) {
  return (
    <div>
      <div className="text-[11px] text-emerald-900/60">{label}</div>
      <div className="font-semibold text-base text-emerald-900">
        {yen(value)}
      </div>
    </div>
  );
}

function BottomHandle() {
  return (
    <div className="flex justify-center mt-4">
      <span className="inline-block h-1.5 w-12 rounded-full bg-emerald-200/80" />
    </div>
  );
}

/* ---------- KPIカード ---------- */
function SummaryBar({
  inTotal,
  outTotal,
  net,
  yen,
}: {
  inTotal: number;
  outTotal: number;
  net: number;
  yen: (v: number | string) => string;
}) {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center md:justify-between gap-3">
      <MetricCard label="入金" value={yen(inTotal)} />
      <MetricCard label="出金" value={yen(outTotal)} />
      <MetricCard label="収支" value={yen(net)} net={net} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  net,
}: {
  label: string;
  value: string;
  net?: number;
}) {
  let ring = "ring-emerald-100";
  let text = "text-emerald-900";
  let bg = "from-white to-emerald-50/40";
  let icon: string | null = null;
  let labelTint = "text-slate-600";

  if (typeof net === "number") {
    if (net > 0) {
      ring = "ring-emerald-200";
      text = "text-emerald-900";
      bg = "from-white to-emerald-50/70";
      icon = "▲";
      labelTint = "text-emerald-700/80";
    } else if (net < 0) {
      ring = "ring-rose-200";
      text = "text-rose-800";
      bg = "from-white to-rose-50/50";
      icon = "▼";
      labelTint = "text-rose-700/80";
    } else {
      ring = "ring-slate-200";
      text = "text-slate-800";
      bg = "from-white to-slate-50/40";
      icon = "＝";
      labelTint = "text-slate-600";
    }
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center
                  rounded-xl px-4 py-3 min-w-[9.5rem] sm:min-w-[10.5rem]
                  ring-1 ${ring}
                  bg-gradient-to-b ${bg}
                  shadow-[0_1px_0_rgba(22,163,74,0.06)]
                  hover:shadow-md hover:-translate-y-0.5 transition`}
      title={label}
    >
      <div className={`text-[11px] ${labelTint} flex items-center gap-1`}>
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="tracking-wide">{label}</span>
      </div>
      <div
        className={`text-base font-bold ${text} tracking-wide tabular-nums`}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------- 編集フォーム ---------- */
function EditForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Rec;
  onCancel: () => void;
  onSave: (v: Rec) => void;
}) {
  const [form, setForm] = useState<Rec>({
    date: initial?.date ?? "",
    category: initial?.category ?? "",
    details: initial?.details ?? "",
    inAmount: initial?.inAmount ?? "",
    outAmount: initial?.outAmount ?? "",
    memo: initial?.memo ?? "",
  });

  const bind =
    (k: keyof Rec) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((s) => ({ ...s, [k]: (e.target as any).value }));

  return (
    <>
      {/* ✖：右上 */}
      <button
        className="absolute right-3 top-3 p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200"
        onClick={onCancel}
        title="閉じる"
      >
        <FaTimes />
      </button>

      <h3 className="text-sm font-bold text-emerald-900 mt-8">編集</h3>

      <div className="space-y-3">
        <L label="日付">
          <input
            type="date"
            className="i"
            value={form.date}
            onChange={bind("date")}
          />
        </L>

        <L label="カテゴリ">
          <select
            className="i"
            value={form.category}
            onChange={bind("category")}
          >
            <option value="">選択してください</option>
            <option value="食費">食費</option>
            <option value="住居">住居</option>
            <option value="交通">交通</option>
            <option value="雑費">雑費</option>
            <option value="収入">収入</option>
            <option value="その他">その他</option>
          </select>
        </L>

        <L label="詳細">
          <input
            className="i"
            value={form.details}
            onChange={bind("details")}
          />
        </L>

        <L label="入金">
          <input
            className="i text-right"
            inputMode="numeric"
            value={form.inAmount as any}
            onChange={bind("inAmount")}
            placeholder="数値または空欄"
          />
        </L>

        <L label="出金">
          <input
            className="i text-right"
            inputMode="numeric"
            value={form.outAmount as any}
            onChange={bind("outAmount")}
            placeholder="数値または空欄"
          />
        </L>

        <L label="メモ">
          <textarea
            className="i"
            rows={3}
            value={form.memo}
            onChange={bind("memo")}
          />
        </L>
      </div>

      {/* 右下に保存 */}
      <div className="flex justify-end pt-3">
        <button
          className="px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={() => onSave(form)}
        >
          保存
        </button>
      </div>

      <BottomHandle />

      <style jsx>{`
        .i {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: #fff;
        }
      `}</style>
    </>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] text-emerald-900/60 mb-1">{label}</div>
      {children}
    </label>
  );
}
