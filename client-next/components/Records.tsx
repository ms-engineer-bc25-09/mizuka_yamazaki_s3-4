import React from "react";
import { FaBook, FaTrash, FaEdit } from "../icons";

interface RecordProps {
  date: string;
  category: string;
  details: string;
  inAmount: number | string;
  outAmount: number | string;
  memo: string;
  index: number; // recordsData の index
  openRecordIndex: number | null;
  setOpenRecordIndex: (index: number | null) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
}

const Record: React.FC<RecordProps> = ({
  date,
  category,
  details,
  inAmount,
  outAmount,
  memo,
  index,
  openRecordIndex,
  setOpenRecordIndex,
  onDelete,
  onEdit,
}) => {
  return (
    <tr className="text-center">
      <td className="px-3">{date}</td>
      <td className="px-3">{category}</td>
      <td className="px-3">{inAmount || "-"}</td>
      <td className="px-3">{outAmount || "-"}</td>
      <td className="px-3" style={{ verticalAlign: "middle" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            whiteSpace: "nowrap",
          }}
        >
          {/* 詳細（トグル） */}
          <FaBook
            style={{ cursor: "pointer" }}
            onClick={() =>
              openRecordIndex === index ? setOpenRecordIndex(null) : setOpenRecordIndex(index)
            }
            title="詳細"
          />

          {/* 編集（鉛筆） */}
          <FaEdit
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(index)}
            title="編集"
          />

          {/* 削除（ゴミ箱） */}
          <FaTrash
            style={{ cursor: "pointer" }}
            onClick={() => onDelete(index)}
            title="削除"
          />
        </div>
      </td>
    </tr>
  );
};

export default Record;
