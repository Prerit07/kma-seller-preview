"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCityData, setPropertyMasterData, setSelectedCity } from "@/store/homeHeaderSlice";

interface HeaderDataSyncProps {
  propertyMasterData?: unknown[] | null;
  propertyCitiesData?: { allCities?: { id: string; name: string }[]; [key: string]: unknown } | null;
}

/**
 * Syncs server-fetched header data into the global header store.
 * Render this once per page when you have server-fetched propertyMasterData and/or cities.
 * Header and footer will then read from the store everywhere.
 */
export default function HeaderDataSync({
  propertyMasterData,
  propertyCitiesData,
}: HeaderDataSyncProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (Array.isArray(propertyMasterData) && propertyMasterData.length > 0) {
      dispatch(setPropertyMasterData(propertyMasterData));
    }
  }, [dispatch, propertyMasterData]);

  useEffect(() => {
    if (propertyCitiesData) {
      dispatch(setCityData(propertyCitiesData));
      const findCity = propertyCitiesData?.allCities?.find(
        (item: { name: string }) => item.name === "Gurgaon"
      );
      if (findCity) {
        dispatch(setSelectedCity(findCity));
      }
    }
  }, [dispatch, propertyCitiesData]);

  return null;
}
