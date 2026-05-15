import CopyRightFooter from "../footer/copyrightFooter";
import UserHeader from "../header/userHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative w-full min-h-[calc(100dvh-10dvh)] md:min-h-[calc(100dvh-7dvh)] bg-list-background">
        <div className="absolute top-0 left-0 w-full h-[450px] bg-blue rounded-b-[25px] sm:rounded-b-[60px] lg:rounded-b-[80px] xl:rounded-b-[100px]"></div>
        <div className="sticky top-0 z-50 w-full flex justify-center">
          <UserHeader />
        </div>
        <div className="flex justify-center pt-[10rem] pb-[2rem]  relative z-1 w-full">
          <div className="w-[80%] xl:w-[85%]  flex">
            {children}
          </div>
        </div>
      </div>
      <CopyRightFooter />
    </div>
  );
}
