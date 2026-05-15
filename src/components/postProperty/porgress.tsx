"use client";
import { useStepProgress } from "@/api/hooks/useStepProgress";
import styled from "@emotion/styled";
import { LinearProgress, linearProgressClasses } from "@mui/material";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#A6A6A67D",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#C27423",
  },
}));

export default function Progress() {
  const { totalProgress } = useStepProgress();

  return (
    <div className="flex w-[100%] flex-col gap-[2px]">
      <p className="text-xs font-semibold lg:text-sm text-text-black text-end">
        {totalProgress}%
      </p>
      <BorderLinearProgress variant="determinate" value={totalProgress} />
    </div>
  );
}
