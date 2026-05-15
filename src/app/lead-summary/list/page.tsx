import type { Metadata } from "next";
import { fetchPropertyMasterData } from "@/app/api/home";
import HeaderDataSync from "@/components/header/HeaderDataSync";
import AboutusDataSync from "@/components/footer/AboutusDataSync";
import HomeFooter from "@/components/footer/homeFooter";
import UserHeader from "@/components/header/userHeader";
import LeadSummaryListClient from "./_components/LeadSummaryListClient";

export const metadata: Metadata = {
  title: "Lead Summary List | KMA Property",
};

export default async function LeadSummaryListPage() {
  let propertyMasterData: any = await fetchPropertyMasterData();
  if (propertyMasterData?.success) {
    propertyMasterData = propertyMasterData.data;
  } else {
    propertyMasterData = [];
  }

  return (
    <>
      <HeaderDataSync propertyMasterData={propertyMasterData} />
      <div className="relative w-full bg-list-background">
        <div className="absolute h-[420px] w-full rounded-b-[25px] bg-blue sm:rounded-b-[60px] lg:rounded-b-[80px] xl:rounded-b-[100px]" />
        <div className="absolute left-0 top-5 z-20 flex w-full justify-center">
          <UserHeader />
        </div>
        <div className="relative z-10 flex justify-center px-4 pb-10 pt-[9.5rem] sm:px-6">
          <div className="w-full max-w-[1220px]">
            <LeadSummaryListClient />
          </div>
        </div>
      </div>
      <AboutusDataSync />
      <HomeFooter />
    </>
  );
}

