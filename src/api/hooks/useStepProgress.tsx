import { STEP_PROGRESS_PERCENTAGE } from "@/lib/enums";
import { getActiveStep, selectTotalProgress, updateStepProgress } from "@/store/postPropertyProgress";
import { RootState } from "@/store/store";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useStepProgress = () => {
  const dispatch = useDispatch();
  const activeStep = useSelector(getActiveStep);
  const totalProgress = useSelector((state: RootState) =>
    selectTotalProgress(state.postPropertyProgress)
  );

  /**
   * Calculates current step progress based on visible + filled fields
   */
  const calculateProgress = useCallback(() => {
    const fieldElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-field]")
    );

    const visibleFields = fieldElements.filter(
      (el) => el.offsetParent !== null
    );
    const total = visibleFields.length;

    if (total === 0) {
      dispatch(updateStepProgress({ step: activeStep, progress: 0 }));
      return;
    }

    const filled = visibleFields.filter(
      (el) => el.dataset.hasValue === "true"
    ).length;

    const stepWeight = STEP_PROGRESS_PERCENTAGE[activeStep] || 0;
    const newProgress = ((filled / total) * stepWeight).toFixed(2);

    dispatch(
      updateStepProgress({
        step: activeStep,
        progress: Number(newProgress),
      })
    );
  }, [activeStep, dispatch]);

  /**
   * Auto-run whenever visible or filled fields change
   */

  // useEffect(() => {
  //   const observer = new MutationObserver(() => calculateProgress());
  //   observer.observe(document.body, {
  //     attributes: true,
  //     childList: true,
  //     subtree: true,
  //     attributeFilter: ["data-has-value", "style", "class"],
  //   });

  //   calculateProgress();

  //   return () => observer.disconnect();
  // }, [calculateProgress]);

  return { calculateProgress, totalProgress };
};
