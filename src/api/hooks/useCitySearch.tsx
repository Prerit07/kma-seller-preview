import { OptionType } from "@/components/common/asyncSelect";
import { City, getCitySearchApiHandler } from "@/services/masterService";
import { useRef, useCallback, useEffect } from "react";

export const useCitySearch = () => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCities = useCallback((inputValue: string): Promise<OptionType[]> => {
    return new Promise((resolve) => {
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // if (inputValue.length < 3) {
      //   resolve([]);
      //   return;
      // }

      debounceRef.current = setTimeout(async () => {
        try {
          const cities = await getCitySearchApiHandler(inputValue);
          if(Array.isArray(cities)){
            const modifiedData = cities.map(item => {
                return {label: item.name, value: item.id || item.name, ...item}
            })
            resolve(modifiedData)
          }else{
            resolve([]);
          }
        } catch (error) {
          console.error("City fetch error:", error);
          resolve([]);
        }
      }, 300);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { loadCities };
};
