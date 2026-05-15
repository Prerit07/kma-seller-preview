"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import type { RootState } from "./store";
import {
  getCityData,
  getCityLoader,
  getPropertyMasterData,
  getSelectedCity,
  getAboutusData,
  getUserRole,
  setCityData,
  setCityLoader,
  setSelectedCity,
  setUserRole,
} from "./homeHeaderSlice";
import { getCityListApiHandler } from "@/services/homeService";
import type { CitiesResponse } from "@/services/homeService";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function getStoredUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    // Role alone signals logged-in. Cross-domain hydrated users may not have
    // a name in localStorage until /create-account is finished.
    if (typeof parsed.role === "string" && parsed.role.trim().length > 0) {
      return parsed.role;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Hook to read and update header-related state from the global store.
 * Use this anywhere you need header data (city, property master, about us, user role).
 * Optionally syncs user role from localStorage on mount.
 */
export function useHeaderStore(syncUserRole = false) {
  const dispatch = useDispatch();

  const selectedCity = useSelector(getSelectedCity);
  const aboutsUsData = useSelector(getAboutusData);
  const cityData = useSelector(getCityData);
  const cityLoader = useSelector(getCityLoader);
  const propertyMasterData = useSelector(getPropertyMasterData);
  const userRole = useSelector(getUserRole);

  const { mutate: fetchCities, isPending: cityLoaderMutation } = useMutation({
    mutationFn: getCityListApiHandler,
    onSuccess: (response: CitiesResponse) => {
      const findCity = response?.allCities?.find((item) => item.name === "Gurgaon");
      if (findCity) {
        dispatch(setSelectedCity(findCity as RootState["homeHeader"]["selectedCity"]));
      }
      dispatch(setCityData(response));
    },
    onSettled: () => {
      dispatch(setCityLoader(false));
    },
    onMutate: () => {
      dispatch(setCityLoader(true));
    },
    onError: () => {},
  });

  const isLoading = cityLoader || cityLoaderMutation;

  useEffect(() => {
    if (syncUserRole) {
      dispatch(setUserRole(getStoredUserRole()));
    }
  }, [dispatch, syncUserRole]);

  // When store has no city data yet, fetch once so header works on any page (e.g. my-list, about-us)
  const hasFetchedCitiesRef = useRef(false);
  useEffect(() => {
    if (!cityData && !hasFetchedCitiesRef.current) {
      hasFetchedCitiesRef.current = true;
      fetchCities({});
    }
  }, [cityData, fetchCities]);

  const fetchCitiesStable = useCallback(
    (payload: { search?: string; latitude?: string; longitude?: string } = {}) => {
      fetchCities(payload);
    },
    [fetchCities]
  );

  return {
    selectedCity,
    aboutsUsData,
    cityData,
    cityLoader: isLoading,
    propertyMasterData: Array.isArray(propertyMasterData) ? propertyMasterData : [],
    userRole,
    fetchCities: fetchCitiesStable,
  };
}
