'use client'

import ContactInformation from "../contactInformation";
import CopyRightFooter from "../footer/copyrightFooter";
import PostPropertyFlowHeader from "../header/postPropertyFlowHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="relative w-full min-h-[calc(100dvh-10dvh)] md:min-h-[calc(100dvh-7dvh)] bg-list-background overflow-hidden">
        <div className="absolute w-full flex justify-center top-5 z-10">
          <PostPropertyFlowHeader />
        </div>
        <div className="absolute top-0 left-0 w-full h-[450px] bg-blue rounded-b-[25px] sm:rounded-b-[60px] lg:rounded-b-[80px] xl:rounded-b-[100px]" />

        <div className="flex justify-center pt-[10rem] md:pt-[8.5rem] pb-[2rem] relative z-1 w-full">
          <div className="w-[90%] xl:w-[75%] min-h-[66dvh] flex">
            {children}
          </div>
        </div>
      </div>
      <CopyRightFooter />
      <ContactInformation />
    </div>
  );
}
