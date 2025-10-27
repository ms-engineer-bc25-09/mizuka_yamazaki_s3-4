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

type Rec = {
  date: string; // "YYYY-MM-DD"
  category: string;
  details?: string;
  inAmount?: number | "";
  outAmount?: number | "";
  memo?: string;
};

type ModalState =
  | { index: number; mode: "view"; initial: null }
  | { index: number | null; mode: "edit"; initial: Rec };

export default function Home() {
  const [recordsData, setRecordsData] = useState<Rec[]>([]);
  const [modal, setModal] = useState<ModalState>({ index: -1, mode: "view", initial: null });
  const [currentMonth, setCurrentMonth] = useState<string>("");

  // 取得＆新しい順にソート
  useEffect(() => {
    fetch("http://localhost:3001/recordsData")
      .then((res) => res.json())
      .then((data: Rec[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecordsData(sorted);
      })
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

  // 月一覧（新しい順）
  const monthOptionsDesc = Array.from(
    new Set(recordsData.map((r) => r.date?.slice(0, 7)).filter(Boolean))
  )
    .sort()
    .reverse();

  const monthOptionsAsc = [...monthOptionsDesc].reverse();

  // 初期表示（月は最新）
  useEffect(() => {
    if (!currentMonth && monthOptionsDesc.length) setCurrentMonth(monthOptionsDesc[0]);
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
  const openView = (index: number) => setModal({ index, mode: "view", initial: null });
  const openEditExisting = (index: number) =>
    setModal({ index, mode: "edit", initial: recordsData[index] });
  const openEditNew = () =>
    setModal({
      index: null,
      mode: "edit",
      initial: { date: "", category: "", details: "", inAmount: "", outAmount: "", memo: "" },
    });
  const closeModal = () => setModal({ index: -1, mode: "view", initial: null });

  const openRecordIndex = modal.mode === "view" && modal.index >= 0 ? modal.index : null;
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

  // 月ナビ
  const goPrevMonth = () => {
    const idx = monthOptionsDesc.indexOf(currentMonth);
    if (idx >= 0 && idx < monthOptionsDesc.length - 1) {
      setCurrentMonth(monthOptionsDesc[idx + 1]);
    }
  };
  const goNextMonth = () => {
    const idx = monthOptionsDesc.indexOf(currentMonth);
    if (idx > 0) setCurrentMonth(monthOptionsDesc[idx - 1]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100/30 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-md border border-blue-200/70 p-5 relative">
          {/* 右上：新規 */}
          <button
            className="absolute right-5 top-5 text-blue-800 hover:text-blue-600"
            onClick={openEditNew}
            title="データの追加"
          >
            <FaPlus size={22} style={{ cursor: "pointer" }} />
          </button>

          {/* 月見出し */}
          <div className="mt-1 flex items-center justify-center gap-4">
            <button
              className="p-1.5 rounded-lg text-blue-800/80 hover:bg-blue-50 disabled:opacity-40"
              onClick={goPrevMonth}
              disabled={monthOptionsDesc.indexOf(currentMonth) === monthOptionsDesc.length - 1}
              aria-label="前の月"
              title="前の月"
            >
              <FaChevronLeft size={18} />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-base sm:text-lg font-semibold tracking-wide text-blue-900">
                {currentMonth || "---- --"}
              </span>
            </div>

            <button
              className="p-1.5 rounded-lg text-blue-800/80 hover:bg-blue-50 disabled:opacity-40"
              onClick={goNextMonth}
              disabled={monthOptionsDesc.indexOf(currentMonth) <= 0}
              aria-label="次の月"
              title="次の月"
            >
              <FaChevronRight size={18} />
            </button>
          </div>

          {/* 当月サマリ */}
          <SummaryBar inTotal={totals.in} outTotal={totals.out} net={net} yen={yen} />

          {/* 一覧 */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-blue-200/60 shadow-sm">
            <table className="w-full table-fixed text-[11px] sm:text-sm md:text-base">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="px-3 py-2 font-semibold text-center">日付</th>
                  <th className="px-3 py-2 font-semibold text-center">カテゴリ</th>
                  <th className="px-3 py-2 font-semibold text-center">入金</th>
                  <th className="px-3 py-2 font-semibold text-center">出金</th>
                  <th className="px-3 py-2 font-semibold text-center">操作</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-blue-100 [&>tr:hover]:bg-blue-50/70 [&>tr>td]:py-2">
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

          {/* ▼▼ モーダル（閲覧 / 編集） ▼▼ */}
          {(openRecordIndex !== null || modal.mode === "edit") && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-32"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity" />
              <div
                className="relative bg-white rounded-2xl border border-blue-200 shadow-lg w-full max-w-[420px] p-6 space-y-5 text-sm text-slate-800"
                onClick={(e) => e.stopPropagation()}
                style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                {/* 閲覧モード */}
                {modal.mode === "view" && r && (
                  <>
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
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

                    <h3 className="text-sm font-bold text-blue-900 mt-9">{r?.date}</h3>

                    <div className="space-y-3">
                      <Item label="カテゴリ" value={r?.category} />
                      <Item label="詳細" value={r?.details || "-"} />
                      <Money label="入金" value={r?.inAmount ?? 0} yen={yen} />
                      <Money label="出金" value={r?.outAmount ?? 0} yen={yen} />
                      <Item label="メモ" value={r?.memo?.trim() ? r.memo : "-"} />
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

                {/* ★ 編集モード（復活） */}
                {modal.mode === "edit" && (
                  <EditForm
                    initial={modal.initial as Rec}
                    onCancel={closeModal}
                    onSave={(updated) => {
                      if (modal.index === null) {
                        // 新規
                        setRecordsData((prev) =>
                          [...prev, normalize(updated)].sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                          )
                        );
                        const newMonth = (updated.date || "").slice(0, 7);
                        if (newMonth) setCurrentMonth(newMonth);
                        closeModal();
                      } else {
                        // 既存更新
                        setRecordsData((prev) => {
                          const next = [...prev];
                          next[modal.index!] = normalize(updated);
                          return next.sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                          );
                        });
                        const updMonth = (updated.date || "").slice(0, 7);
                        if (updMonth) setCurrentMonth(updMonth);
                        openView(modal.index);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}
          {/* ▲▲ モーダルここまで ▲▲ */}

          {/* 月リスト */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-blue-900">月リスト</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {monthOptionsAsc.map((m) => (
                <li key={m}>
                  <button
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset
                      ${m === currentMonth
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-blue-50 text-blue-800 ring-blue-200 hover:bg-blue-100"
                      }`}
                    onClick={() => setCurrentMonth(m)}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          </div>
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

/** 小パーツ */
function Item({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] text-blue-900/60">{label}</div>
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
      <div className="text-[11px] text-blue-900/60">{label}</div>
      <div className="font-semibold text-base text-blue-900">{yen(value)}</div>
    </div>
  );
}

function BottomHandle() {
  return (
    <div className="flex justify-center mt-4">
      <span className="inline-block h-1.5 w-12 rounded-full bg-blue-200/80" />
    </div>
  );
}

/** 当月サマリ（縦2行・角丸控えめ） */
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
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <MetricCard label="入金" value={yen(inTotal)} />
      <MetricCard label="出金" value={yen(outTotal)} />
      <MetricCard label="収支" value={yen(net)} net={net} />
    </div>
  );
}

/** KPIカード（縦2行・rounded-xl・淡グラデ） */
function MetricCard({
  label,
  value,
  net,
}: {
  label: string;
  value: string;
  net?: number;
}) {
  let ring = "ring-blue-200";
  let text = "text-blue-900";
  let bg = "from-white to-blue-50/30";
  let icon: string | null = null;
  let labelTint = "text-slate-600";

  if (typeof net === "number") {
    if (net > 0) {
      ring = "ring-emerald-200";
      text = "text-emerald-800";
      bg = "from-white to-emerald-50/40";
      icon = "▲";
      labelTint = "text-emerald-700/80";
    } else if (net < 0) {
      ring = "ring-rose-200";
      text = "text-rose-800";
      bg = "from-white to-rose-50/40";
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
                  shadow-[0_1px_0_rgba(30,64,175,0.05)]
                  hover:shadow-md hover:-translate-y-0.5 transition`}
      title={label}
    >
      <div className={`text-[11px] ${labelTint} flex items-center gap-1`}>
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="tracking-wide">{label}</span>
      </div>
      <div className={`text-base font-bold ${text} tracking-wide tabular-nums`}>
        {value}
      </div>
    </div>
  );
}

/** 編集フォーム（カテゴリはセレクト） */
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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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

      <h3 className="text-sm font-bold text-blue-900 mt-8">編集</h3>

      <div className="space-y-3">
        <L label="日付">
          <input type="date" className="i" value={form.date} onChange={bind("date")} />
        </L>

        <L label="カテゴリ">
          <select className="i" value={form.category} onChange={bind("category")}>
            <option value="">選択してください</option>
            <option value="食費">食費</option>
            <option value="住居">住居</option>
            <option value="交通">交通</option>
            <option value="日用品">日用品</option>
            <option value="娯楽">娯楽</option>
            <option value="医療・保険">医療・保険</option>
            <option value="その他">その他</option>
          </select>
        </L>

        <L label="詳細">
          <input className="i" value={form.details} onChange={bind("details")} />
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
          <textarea className="i" rows={3} value={form.memo} onChange={bind("memo")} />
        </L>
      </div>

      {/* 右下に保存 */}
      <div className="flex justify-end pt-3">
        <button
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
          border-radius: 0.75rem; /* ちょい丸で統一感 */
          border: 1px solid rgba(59, 130, 246, 0.3); /* blue-500 30% */
          background: #fff;
        }
      `}</style>
    </>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] text-blue-900/60 mb-1">{label}</div>
      {children}
    </label>
  );
}
