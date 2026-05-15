import {
  channelPartnerMenuList,
  headerMenuList,
  helpMenuList,
  moreMenuList,
  projectMenuList,
} from "@/lib/constants";
import Image from "next/image";
import RentSellHeaderView from "./rentSellHeaderView";
import CityView from "./cityView";
import { useRouter } from "nextjs-toploader/app";

export default function HomeMobileHeader({
  open,
  onClose,
  activeSubMenu,
  openSubMenu,
  closeSubMenu,
}: {
  open: boolean;
  onClose: () => void;
  activeSubMenu: string | null;
  openSubMenu: (label: string) => void;
  closeSubMenu: () => void;
}) {
  const router = useRouter();

  const listMapping = {
    project: projectMenuList,
    channel_partner: channelPartnerMenuList,
    help: helpMenuList,
    more: moreMenuList,
  };
  const renderSubMenuList = () => {
    return listMapping[activeSubMenu] ?? [];
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full sm:w-[50%] h-[100dvh] bg-white z-40 transition-transform duration-300 ease-in-out overflow-y-auto 2md:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {!activeSubMenu && (
        <div className="p-3">
          <div className="flex justify-end">
            <Image
              onClick={onClose}
              src={"/assets/close-icon.svg"}
              width={30}
              height={30}
              alt="close"
            />
          </div>

          <div className="flex  flex-col gap-2 text-text-black mt-3">
            <div onClick={() => {
                openSubMenu('city')
            }} className="flex sm:hidden justify-between items-center">
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/location-blue.svg"
                  className="text-gray-300"
                  width={25}
                  height={25}
                  alt="location"
                  style={{ width: "20px", height: "20px" }}
                />
                <p className="pl-1 text-base"> City </p>
              </div>
              <Image
                src="/assets/down-arrow-blue.svg"
                width={25}
                height={25}
                alt="arrow"
              />
            </div>

            {headerMenuList.map((item) => (
              <div
                key={item.value}
                onClick={() => {
                  if (item.value === "refer_and_earn") {
                    router.push("/refer-and-earn");
                    onClose();
                  } else {
                    openSubMenu(item.value);
                  }
                }}
                className="flex justify-between items-center"
              >
                <p
                  key={item.value}
                  className="mt-2 break-word text-base nowrap w-max border-b-2 border-transparent hover:border-blue transition-colors duration-200 cursor-pointer px-1.5  pb-1"
                >
                  {item.label}
                </p>
                {item.value != "refer_and_earn" && (
                  <Image
                    src="/assets/down-arrow-blue.svg"
                    width={25}
                    height={25}
                    alt="arrow"
                  />
                )}
              </div>
            ))}

            <div
              onClick={() => {
                openSubMenu("more");
              }}
              className="flex justify-between items-center"
            >
              <p
                key={"more"}
                className="mt-2 break-word text-base nowrap w-max border-b-2 border-transparent hover:border-blue transition-colors duration-200 cursor-pointer px-1.5  pb-1"
              >
                {"More"}
              </p>
              <Image
                src="/assets/down-arrow-blue.svg"
                width={25}
                height={25}
                alt="arrow"
              />
            </div>
          </div>
        </div>
      )}

      {activeSubMenu && (
        <div className="p-3">
          <div className="flex justify-end">
            <Image
              onClick={onClose}
              src={"/assets/close-icon.svg"}
              width={30}
              height={30}
              alt="close"
            />
          </div>
          <div
            onClick={closeSubMenu}
            className="flex gap-3 text-base text-text-black font-medium"
          >
            <Image
              src={"/assets/right-arrow-blue.svg"}
              width={25}
              height={25}
              alt="arrow"
            />{" "}
            Back
          </div>

          {(activeSubMenu != "buy" ||
            activeSubMenu != "rent" ||
            activeSubMenu != "city") && (
            <div className="flex flex-col gap-2 mt-3">
              {renderSubMenuList().map((item, index) => {
                return (
                  <>
                    <p
                      onClick={() => {
                        const routes: Record<string, string> = {
                          "Join Us": "/signup",
                          "Sales Enquiry": "/sales-enquiry",
                          "Meet The Team": "/meet-the-team",
                          "Help Center": "/contact-us",
                          "Find an agent": "/channel-partner",
                        };
                        const route = routes[item.label];
                        if (route) {
                          router.push(route);
                          onClose();
                        }
                      }}
                      className="text-base text-text-black hover:bg-list-background cursor-pointer px-2 py-1.5 rounded-lg"
                    >
                      {item.label}
                    </p>
                    {index != moreMenuList.length - 1 && (
                      <div className="border-b border-border mx-2"></div>
                    )}
                  </>
                );
              })}
            </div>
          )}
          {
           ( activeSubMenu == 'buy' || activeSubMenu == 'rent') && <div>
                <RentSellHeaderView type={activeSubMenu}/>
            </div>
          }
          {
            activeSubMenu == 'city' && <div>
                <CityView handleScroll={onClose}/>
            </div>
          }
        </div>
      )}
    </div>
  );
}
