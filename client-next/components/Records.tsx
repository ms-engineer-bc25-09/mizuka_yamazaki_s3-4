import React from 'react';
import { FaBook, FaTrash } from 'react-icons/fa';

interface RecordProps {
  date: string;
  category: string;
  details: string;
  inAmount: number| string;
  outAmount: number| string;
  index: number;
  openRecordIndex: number | null;
  setOpenRecordIndex: (index: number | null) => void;
}

const Record: React.FC<RecordProps> = ({
  date,
  category,
  details,
  inAmount,
  outAmount,
  index,
  openRecordIndex,
  setOpenRecordIndex,
}) => {
  return (
    <tr>
      <td>{date}</td>
      <td>{category}</td>
      <td>{details}</td>
      <td>{inAmount}</td>
      <td>{outAmount}</td>
      <td>
        <FaBook
          style={{ cursor: 'pointer', marginRight: '8px' }}
          onClick={() =>
            openRecordIndex === index ? setOpenRecordIndex(null) : setOpenRecordIndex(index)
          }
        />
        <FaTrash style={{ cursor: 'pointer' }} />
      </td>
    </tr>
  );
};

export default Record;
