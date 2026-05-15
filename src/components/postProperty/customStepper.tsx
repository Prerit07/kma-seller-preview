"use client";
import { useStepProgress } from "@/api/hooks/useStepProgress";
import { Step1DetailsResponse, step1PostPropertyDetailsApiHandler } from "@/services/postProperty";
import { getActiveStep, getStepList, setActiveStep, step, updateStepProgress } from "@/store/postPropertyProgress";
import { step1Data } from "@/store/postPropertySlice";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


const StepContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
}));

const StepItem = styled(Box)<{active?: boolean}>(({ active }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
  position: "relative",
  // height: "100%",
  cursor: active ? 'pointer' : 'default'
}));

const Circle = styled("div")<{ active?: boolean }>(({ active }) => ({
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: active ? "var(--color-blue)" : "#01004840",
  color: "var(--color-white)",
  fontWeight: 600,
  boxShadow: active
    ? "0 0 8px rgba(10, 4, 60, 0.3)"
    : "0 0 4px rgba(0, 0, 0, 0.1)",
  position: "relative",
}));

const Line = styled("div")<{ isLast?: boolean; active?: boolean }>(
  ({ active }) => ({
    position: "absolute",
    left: "calc(50% - 1.5px)",
    borderImage: active
      ? `repeating-linear-gradient(
    to bottom,
    var(--color-blue) 0,
    var(--color-blue) 8px,
    transparent 8px,
  ) 1`
      : `repeating-linear-gradient(
    to bottom,
    #B0B0C4 0,
    #B0B0C4 8px, 
    transparent 8px,
    transparent 16px
  ) 1`,
    borderWidth: "1.5px",
  })
);

const CleanAccordion = styled(Accordion)(() => ({
  background: "transparent",
  boxShadow: "none",
  "&::before": { display: "none" },
  "& .MuiAccordionSummary-root": {
    minHeight: "0 !important",
    padding: 0,
    margin: 0,
  },
  "& .MuiAccordionSummary-content": {
    margin: "0 !important",
    padding: 0,
  },
  "& .MuiAccordionDetails-root": {
    padding: 0,
    margin: 0,
    marginTop: "20px",
  },
}));

function Stepper({activeStep, stepList, basicDetails, totalProgress, step1FormData}: {activeStep: number, stepList: step[], basicDetails: any, totalProgress: number, step1FormData: any}) {
  const dispatch = useDispatch()
  const propertyType = step1FormData?.propertyType?.code ?? basicDetails?.propertyType?.code
  const isStep3Skipped = ['res-sale-plot', 'res-sale-agri-land', 'com-rent-warehouse', 'com-sale-warehouse', 'com-rent-plot', 'com-sale-plot'].includes(propertyType ?? '')
  
  let renderList = () => {
    if(isStep3Skipped){
      let updatedList = stepList.map(item => {
        if(item.number == 4){
          return {...item, number: 3}
        }
        return item
      })
      return updatedList
    }
    return stepList
  }

  return (
    <StepContainer className="flex-col">
      {renderList().map((step, index) => {
        const getActive = () => {
          if(index == 0 && (totalProgress >= 25 || (isStep3Skipped && totalProgress >= 33))){
            return true
          }else if(index == 1 && (totalProgress >= 50 || (isStep3Skipped && totalProgress >= 66))){
            return true
          }else if(index == 2 && totalProgress >= 75){
            return true
          }else if(index == 3 && totalProgress >= 100){
            return true
          }else{
            return activeStep > index
          }
        }

        const active = getActive();
        const isCurrent = activeStep == index + 1;
        const isLast = index === stepList.length - 1;

        const renderStatus = () => {
          if(false && index == 2){
            return 'Skipped'
          }else if(isCurrent){
            return 'In Progress'
          }else if(index == 0 && (totalProgress >= 25 || (isStep3Skipped && totalProgress >= 33))){
            return 'Completed'
          }else if(index == 1 && (totalProgress >= 50 || (isStep3Skipped && totalProgress >= 66))){
            return 'Completed'
          }else if(index == 2 && totalProgress >= 75){
            return 'Completed'
          }else if(index == 3 && totalProgress >= 100){
            return 'Completed'
          }else {
            return 'Pending'
          }

        }

        const renderStatusColor = () => {
          if(false && index == 2){
            return 'text-[#FF901E]'
          }else if(isCurrent){
            return 'text-[#FF901D]'
          }else if(index == 0 && (totalProgress >= 25 || (isStep3Skipped && totalProgress >= 33))){
            return 'text-[#4cac0b]'
          }else if(index == 1 && (totalProgress >= 50 || (isStep3Skipped && totalProgress >= 66))){
            return 'text-[#4cac0b]'
          }else if(index == 2 && totalProgress >= 75){
            return 'text-[#4cac0b]'
          }else if(index == 3 && totalProgress >= 100){
            return 'text-[#4cac0b]'
          }else {
            return 'text-[#8090FF]'
          }
        }

        if(isStep3Skipped && index == 2){
          return ''
        }

        return (
          <StepItem active={active} onClick={() => {
            if(active){
              dispatch(setActiveStep({step: index + 1}))
            }
          }} key={index} className="flex-row h-[120px] sm:h-[90px] 2md:h-auto">
            <div
              className="relative flex flex-col items-center "
              style={{ height: "100%" }}
            >
              <div className="bg-[#0100481A] p-[3px] lg:p-[4px] rounded-full">
                <Circle
                  className="w-[25px] h-[25px] lg:w-[35px] lg:h-[35px] text-xs lg:text-sm"
                  active={active}
                >
                  {step.number}
                </Circle>
              </div>
              {!isLast && (
                <Line
                  className={`${active ? "top-[28px]" : "top-[30px]"} ${active ? 'lg:top-[28px]' : 'lg:top-[43px]'} ${active ? 'h-[calc(100%-28px)]' : 'h-[calc(100%-30px)]'} ${active ? 'lg:h-[calc(100%-28px)]' : 'lg:h-[calc(100%-43px)]'}`}
                  isLast={isLast}
                  active={active}
                />
              )}
            </div>

            <div className="pt-2 gap-1 flex justify-start flex-col pb-[20px]">
              <p className="font-medium text-blue text-base">
                {step.title}
              </p>
              <p className="text-gray-500 text-sm mb-1">
                {step.desc}
              </p>
              <p
                className={`text-xs lg:text-sm font-medium underline ${renderStatusColor()}`}
              >
                {renderStatus()}
              </p>
            </div>
          </StepItem>
        );
      })}
    </StepContainer>
  );
}

export default function StepperCustom() {
  const { totalProgress } = useStepProgress();
  const activeStep = useSelector(getActiveStep);
  const stepList = useSelector(getStepList)
  const params = useParams()
  const step1FormData = useSelector(step1Data)
  const [basicStaticDetail, setBasicStaticDetail] = useState<any>({})
  
  const { data: step1Details } = useQuery({
    queryKey: ["step1-in-stepper-details", params?.propertyId],
    queryFn: async (): Promise<Step1DetailsResponse> => {
      return step1PostPropertyDetailsApiHandler(
        String(params?.propertyId ?? "")
      );
    },
    select: (resposne: Step1DetailsResponse) => {
      return resposne;
    },
    enabled: params?.propertyId ? true : false,
    staleTime: 0,
    refetchOnMount: true,
  });

  useEffect(() => {
    if(step1Details){
        setBasicStaticDetail((pre) => ({
            ...pre,
            propertyListFor: step1Details?.listingType,
            propertyCategory: step1Details?.category,
            propertyType: step1Details?.propertyType,
        }))
      }
  },[step1Details, totalProgress])
  
  return (
    <div className="bg-[#F4F4F4] rounded-[10px] px-[0.75rem] py-[1rem] h-fit">
      <div className="2md:hidden">
        <CleanAccordion className="bg-none">
          <AccordionSummary
            expandIcon={
              <Image
                alt="Arrow"
                src="/assets/down-arrow-outline-black.svg"
                width={18}
                height={18}
              />
            }
          >
            <p className="text-sm text-text-black">
              Step {activeStep} of 4:{" "}
              <span className="text-text-black font-medium">{}</span>
            </p>
          </AccordionSummary>
          <AccordionDetails>
            <Stepper activeStep={activeStep} step1FormData={step1FormData} stepList={stepList} basicDetails={basicStaticDetail} totalProgress={totalProgress}/>
          </AccordionDetails>
        </CleanAccordion>
      </div>
      <div className="hidden 2md:flex">
        <Stepper activeStep={activeStep} step1FormData={step1FormData} stepList={stepList} basicDetails={basicStaticDetail} totalProgress={totalProgress}/>
      </div>
    </div>
  );
}
