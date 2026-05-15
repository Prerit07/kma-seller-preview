import { AREA_UNIT_LIST, PROPERTY_STATUS, propertyStatusColor } from "@/lib/enums";
import { getStatusLabel } from "@/lib/helper";
import { ListingItem } from "@/services/postProperty";
import moment from "moment";
import Image from "next/image";
import { useState } from "react";
import Slider from "react-slick";
interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  direction: "left" | "right";
}

const Arrow: React.FC<ArrowProps> = ({ onClick, disabled, direction }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      className={`cursor-pointer absolute top-1/2 -translate-y-1/2 z-10 
        ${direction === "left" ? "left-2" : "right-2"}
        bg-black/60 text-white p-2 rounded-full
        ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-black"}
      `}
    >
      {direction === "left" ? <Image
                    src="/assets/explore/left-arrow.svg"
                    alt="left-arrow"
                    width={15}
                    height={15}
                  /> : <Image
                                src="/assets/explore/right-arrow.svg"
                                alt="left-arrow"
                                width={15}
                                height={15}
                              />}
    </button>
  );
};


export default function ListCard({data, handleManage}: {data: ListingItem, handleManage: (id) => void}) {
    let imgBaseUrl = process.env.NEXT_PUBLIC_AWS_URL
  const [currentSlide, setCurrentSlide] = useState(0);
    const openManage = () => {
      handleManage(data.id)
    }
    const getStatusColor = (status) => {
      return propertyStatusColor.find(item => item.status == status) ?? null
    }

    const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_, next) => setCurrentSlide(next),
    prevArrow: (
      <Arrow
        direction="left"
        disabled={currentSlide === 0}
      />
    ),
    nextArrow: (
      <Arrow
        direction="right"
        disabled={currentSlide === (data?.photos?.length || 1) - 1}
      />
    )
  };

  return (
    <div
      className="flex flex-col lg:h-[200px] lg:flex-row items-center bg-[#F2F2F2] rounded-[10px] px-2 gap-5 py-2 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={openManage}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openManage();
        }
      }}
    >
      <div className="relative w-[260px] lg:h-full rounded-[5px] overflow-hidden property-slider">
        <Slider {...settings}>
          {data?.photos?.map((img, index) => (
            <div key={index} className="relative h-full w-full">
              <Image
                src={imgBaseUrl + img.fileKey}
                alt="property image"
                width={600}
                height={400}
                className="object-cover h-full"
              />
            </div>
          ))}
        </Slider>
        <div className="absolute top-[5px] right-[5px] px-3 py-1 text-xs font-bold text-white rounded-[5px]" style={{background: getStatusColor(data.status)?.color}}>
            <p>{getStatusColor(data.status)?.name}</p>
        </div>
        <div className="absolute bottom-[5px] left-[5px] px-3 py-1 text-xs text-white rounded-[5px] bg-black/60">
            <p>{data?.photos?.length + ' Photos'}</p>
        </div>
      </div>
      <div className="w-full flex flex-1 flex-col justify-start gap-4 bg-[#F2F2F2]">
        <div className="flex flex-1 justify-between items-center">
          <p className="text-text-gray text-base lg:text-sm">ID: {data.id}</p>
          {/* <button className="bg-[#33AB414D] text-sm text-[#1B8836] flex items-center gap-2 px-4 py-1 rounded-[5px] font-medium">
            {" "}
            <p className="w-2 h-2 bg-[#1B8836] rounded-full"></p>Verify
          </button> */}
        </div>
        <hr className="border-border"></hr>
        <div className="flex justify-start gap-3 items-center">
          <p className="font-semibold text-blue text-lg lg:text-base">
           &#8377; {data.price} / month
            <span className="text-text-gray font-normal"> ({data.area} {AREA_UNIT_LIST.find(item => item.value == data.areaUnit)?.label}) </span>
          </p>
          <button className="bg-light-purple text-sm px-4 py-1 rounded-[5px] text-black">
            {data.listingType.name} | {data.category.name}
          </button>
        </div>
        <div className="flex flex-col">
          <p className="text-blue text-base lg:text-sm font-medium">
            {data.bhkTypeName} {data.propertyType?.name}
          </p>
          <p className="text-text-gray text-sm lg:text-xs">
            {data.address}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-blue text-base lg:text-sm">
            <span className="text-text-gray text-sm">created on: </span> {moment(data.createdAt).format('DD MMM YYYY')}
          </p>
          <button onClick={(e) => {
            e.stopPropagation();
            openManage()
          }} className="cursor-pointer flex gap-2 items-center underline font-medium text-blue text-base">
            Manage <img src="/assets/long-arrow-blue.svg" />
          </button>
        </div>
      </div>
    </div>
  );
}
