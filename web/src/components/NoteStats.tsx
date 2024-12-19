import type React from "react";
import { useRecoilValue } from "recoil";
import { notesSelector } from "../atoms/notesSelector";

/**
 * メモ帳の統計情報を表示するコンポーネントです。
 */
export const NoteStats: React.FC = () => {
  const { totalNum, totalCompletedNum, totalUncompletedNum, percentCompleted } =
    useRecoilValue(notesSelector);

  const formattedPercentCompleted = Math.round(percentCompleted);

  return (
    <ul>
      <li>すべての個数: {totalNum}</li>
      <li>完了したアイテム: {totalCompletedNum}</li>
      <li>未完了のアイテム: {totalUncompletedNum}</li>
      <li>完了した割合: {formattedPercentCompleted}%</li>
    </ul>
  );
};
