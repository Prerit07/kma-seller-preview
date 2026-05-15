'use client'

import UserHeader from "../header/userHeader";
import SellerGuard from "../common/sellerGuard";

export default function MainLayout({ children }:{children:React.ReactNode}) {
  return (
    <SellerGuard>
      <div className="">
        <div className="relative w-full min-h-[calc(100dvh-10dvh)] md:min-h-[calc(100dvh-7dvh)] bg-list-background">
          <div className="absolute top-0 left-0 w-full h-[450px] bg-blue rounded-b-[25px] sm:rounded-b-[60px] lg:rounded-b-[80px] xl:rounded-b-[100px]">
          </div>
          <div className="sticky top-0 z-50 w-full flex justify-center">
            <UserHeader/>
          </div>
          <div className="flex justify-center pt-[10rem] pb-[2rem]  relative z-1 w-full">
            <div className="w-[80%] xl:w-[80%] min-h-[66dvh] flex">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SellerGuard>
  );
}
