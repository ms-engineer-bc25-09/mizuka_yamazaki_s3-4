import React, { useState } from 'react';
import Record from '../components/Records';

function Home() {
  const recordsData = [
    { date: '2025-10-02', category: '家賃', details: '家賃', inAmount: "", outAmount: 100000 },
    { date: '2025-10-01', category: '給料', details: '給料振込', inAmount: 300000, outAmount:"" },
    { date: '2025-09-30', category: '食費', details: '飲み会代', inAmount: "", outAmount: 150000 },
    { date: '2025-09-27', category: '雑収入', details: 'お小遣い', inAmount: "", outAmount: 150000 },
  ];

  // どの行の詳細パネルが開いているか
  const [openRecordIndex, setOpenRecordIndex] = useState<number | null>(null);

  // 月集計の計算（あとで使用）
  const months: string[] = [];
  recordsData.forEach((r) => {
    const month = r.date.slice(0, 7);
    if (!months.includes(month)) months.push(month);
  });

  return (
    <div className="book">
      <h2>家計簿</h2>

      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>カテゴリ</th>
            <th>詳細</th>
            <th>入金</th>
            <th>出金</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {recordsData.map((record, index) => (
            <Record
              key={index}
              index={index}
              {...record}
              openRecordIndex={openRecordIndex}
              setOpenRecordIndex={setOpenRecordIndex}
            />
          ))}
        </tbody>
      </table>

      {/* 詳細パネル */}
      {openRecordIndex !== null && (
        <div className="panel panel-open">
          <h3>{recordsData[openRecordIndex].date}</h3>
          <p>カテゴリ: {recordsData[openRecordIndex].category}</p>
          <p>詳細: {recordsData[openRecordIndex].details}</p>
          <p>入金: {recordsData[openRecordIndex].inAmount}</p>
          <p>出金: {recordsData[openRecordIndex].outAmount}</p>
          <button onClick={() => setOpenRecordIndex(null)}>閉じる</button>
        </div>
      )}

      {/* 月集計の確認用（あとで集計処理を追加） */}
      <div className="month-list">
        <h3>月リスト</h3>
        <ul>
          {months.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;
