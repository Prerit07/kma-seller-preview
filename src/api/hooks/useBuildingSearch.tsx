import { OptionType } from "@/components/common/asyncSelect";
import { BuildingSearchPayload, getBuildingSearchApiHandler, } from "@/services/masterService";
import { useRef, useCallback, useEffect } from "react";

export const useBuildingSearch = () => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadBuildings = useCallback(({query, cityId, cityName}: BuildingSearchPayload): Promise<OptionType[]> => {
    return new Promise((resolve) => {
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!cityId && !cityName) {//query.length < 3 &&
        resolve([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const cities = await getBuildingSearchApiHandler({query, cityName});
          if(Array.isArray(cities)){
            const modifiedData = cities.map(item => {
                return {label: item.name, value: item.id || item.name, ...item}
            })
            resolve(modifiedData)
          }else{
            resolve([]);
          }
        } catch (error) {
          console.error("Building fetch error:", error);
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

  return { loadBuildings };
};
