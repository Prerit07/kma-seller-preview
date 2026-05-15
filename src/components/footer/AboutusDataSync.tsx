"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAboutusData } from "@/store/homeHeaderSlice";
import { AboutusResponse, getAboutUsDataAPiHanlder } from "@/services/homeService";

/**
 * Fetches aboutus configuration and syncs it into Redux.
 * Render this on any page that uses HomeFooter to ensure footer data is available.
 */
export default function AboutusDataSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    getAboutUsDataAPiHanlder().then((response: AboutusResponse) => {
      if (response?.configuration) {
        dispatch(setAboutusData(response.configuration));
      }
    });
  }, [dispatch]);

  return null;
}
