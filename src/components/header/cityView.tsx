import { getUserCoordinates } from "@/api/hooks/useGeoloaction";
import { getSelectedCity, setSelectedCity, type HeaderState } from "@/store/homeHeaderSlice";
import { useHeaderStore } from "@/store/useHeaderStore";
import { InputBase } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { City } from "@/services/homeService";

export default function CityView({ handleScroll }: { handleScroll?: () => void }) {
  const dispatch = useDispatch();
  const selectedCity = useSelector(getSelectedCity);
  const { cityData, fetchCities, cityLoader } = useHeaderStore();
  
  const [cityInput, setCityInput] = useState("");
  const [detecting, setDetecting] = useState(false)
  const allCities = (cityData?.allCities ?? []) as City[];


  const fetchLocation = async () => {
    const location = await getUserCoordinates();
    if (location) {
      setDetecting(true)
      fetchCities({
        latitude: String(location?.lat ?? ""),
        longitude: String(location?.lng ?? ""),
      });
    } else {
    }
  };

  const filterdList = (value: string): City[] => {
    if(value){
      const data = allCities?.filter(item => {
        const name = item.name
        return name.toLowerCase().includes(value.toLowerCase())
      }) ?? []

      if(selectedCity){
        return data.filter(item => item.id != selectedCity?.id)
      }else{
        return data
      }
    }else{
      if(selectedCity){
        return allCities.filter(item => item.id != selectedCity?.id)
      }else{
        return allCities
      }
    }
  }

  const handleSelectCity = (city: City) => {
    dispatch(setSelectedCity(city as unknown as HeaderState["selectedCity"]))
    if(handleScroll){
      handleScroll()
    }
  }

  useEffect(() => {
    setDetecting(false)
  },[cityLoader])

  const normalizedSearch = cityInput.trim().toLowerCase();
  const gridCities = normalizedSearch
    ? allCities.filter((city) => city.name.toLowerCase().includes(normalizedSearch))
    : allCities;

  const otherCities = filterdList(cityInput);

  return (
    <div className="p-2 w-full sm:w-[330px]">
      <div className="flex justify-between items-center px-4 flex-3 border border-border rounded-full">
        <InputBase
          placeholder="Select or type your city"
          fullWidth
          onChange={(event) => {
            setCityInput(event.target.value);
            // clearTimeout(searchRef.current);
            // searchRef.current = setTimeout(() => {
            //   fetchCities({ search: event.target.value });
            // }, 300);
          }}
          value={cityInput}
          className="w-full h-[40px] px-2 text-xs rounded-full"
          inputProps={{
            className:
              "font-ibm-plex-sans! text-sm text-text-gray placeholder:!text-text-gray placeholder:!text-sm placeholder:!opacity-100",
          }}
        />
        <Image
          src="/assets/search-gray.svg"
          width={16}
          height={16}
          alt="search"
        />
      </div>
      <div onClick={fetchLocation} className="cursor-pointer flex justify-start gap-2 mt-4">
        <Image
          src={"/assets/city/purple-location-find.svg"}
          width={20}
          height={20}
          alt="location"
        />
        <p className="text-sm text-[#757BEE]">Detect My Location {detecting && <span className="text-text-gray text-xs">(Detecting...)</span>}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4 max-h-[180px] overflow-y-auto pr-1">
        {gridCities.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectCity(item)}
            className={`flex flex-1 flex-col justify-center items-center gap-1.5 bg-[#F3F3F3] rounded-[5px] px-3 sm:px-1 py-3 ${selectedCity?.id == item.id ? 'grayscale-0' : 'grayscale'} hover:grayscale-0 cursor-pointer`}
          >
            <p className="text-xs text-black">{item.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-base text-text-black font-medium">Other Cities</p>
        <div className="h-full sm:h-[165px] overflow-auto">
          {
            selectedCity && (
              <>
              <p className="text-sm text-text-black bg-list-background cursor-pointer px-2 py-1.5 my-1 rounded-lg">
                  {selectedCity?.name}
                </p>
                  <div className="border-b border-border mx-2"></div>
            </>)
          }
          {normalizedSearch.length > 0 &&
            otherCities?.map((item, index) => {
              return (
                <>
                  <p onClick={() => handleSelectCity(item)} className="text-sm text-text-black hover:bg-list-background cursor-pointer px-2 py-1.5 my-1 rounded-lg">
                    {item.name}
                  </p>
                  {index !== otherCities.length - 1 && (
                    <div className="border-b border-border mx-2"></div>
                  )}
                </>
              );
            })}

          {normalizedSearch.length > 0 && otherCities?.length === 0 && (
            <div className="flex justify-center">
              <p className="text-text-gray">No city found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
