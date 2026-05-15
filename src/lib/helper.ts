import { OptionType } from "@/components/common/select";
import { PROPERTY_STATUS } from "./enums";

type ParamValue = string | number | boolean;
type ParamObject = Record<string, ParamValue | undefined | null>;

export function createURLSearchParam(
  key: string,
  value: ParamValue
): string;

export function createURLSearchParam(
  params: ParamObject
): string;

export function createURLSearchParam(
  arg1: string | ParamObject,
  arg2?: ParamValue
): string {
  const params = new URLSearchParams();

  if (typeof arg1 === "string" && arg2 !== undefined) {
    params.set(arg1, String(arg2));
  } else if (typeof arg1 === "object") {
    Object.entries(arg1).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        params.set(key, String(val));
      }
    });
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
export interface BhkOption {
  id: number;
  name: string;
  isPlusItem?: boolean;
  value: string | number;
  builtUpAreas: [];
  bhk: number;
  isCustom?: boolean
}

export function generateBHKList(showMore = false): BhkOption[] {
  const bhkList: BhkOption[] = [];

  // Add 1RK first
  bhkList.push({
    id: 0,
    name: "1 RK",
    value: 1,
    bhk: 1,
    builtUpAreas: [],
    isCustom: true
  });

  // Add 1BHK to 5BHK with 0.5 increments
  for (let i = 1; i <= 5; i += 0.5) {
    if (i === 5.5) break;

    bhkList.push({
      id: bhkList.length + 1,
      name: `${i % 1 === 0 ? i : i.toFixed(1)} BHK`,
      value: bhkList.length + 1,
      builtUpAreas: [],
      bhk: Math.ceil(Number(i.toFixed(1))),
      isCustom: true
    });
  }
  if(!showMore){
    bhkList.push({
      id: bhkList.length + 1,
      name: "5+ BHK",
      isPlusItem: true,
      value: bhkList.length + 1,
      bhk: 5,
      builtUpAreas: []
    });
  }
 

  if (showMore) {
    for (let i = 6; i <= 12; i++) {
      bhkList.push({
        id: bhkList.length + 1,
        name: `${i} BHK`,
        value: bhkList.length + 1,
        builtUpAreas: [],
        bhk: Number(i),
        isCustom: true
      });
    }
  }

  return bhkList;
}


export function generateBHKAmeneties(value: string): string[] {
  const num = parseInt(value, 10)
  if (isNaN(num) || num < 1) return []

  return Array.from({ length: num + 1 }, (_, i) => (i + 1).toString())
}

export const generateFloors = (count: number): OptionType[] => {
  const baseFloors = [
    {
      label: '-2',
      value: '-2',
    },
    {
      label: '-1',
      value: '-1',
    },
    {
      label: 'Ground',
      value: '0',
    }
  ]

  if(!count) return baseFloors
  let upperFloors: any = Array.from({ length: count }, (_, i) => (i + 1).toString());
  upperFloors = upperFloors.map(item => ({label: item, value: item}))
  return [...baseFloors, ...upperFloors]
};

export const generateLockInPeriod = (count: number): OptionType[] => {
  let upperFloors: any = Array.from({ length: count }, (_, i) => (i + 1).toString());
  upperFloors = upperFloors.map(item => ({label: item + ' month', value: item}))
  return upperFloors
};


export const encodeFilters = (obj: any) => btoa(JSON.stringify(obj));

export const decodeFilters = (str: string) => {
    try { return JSON.parse(atob(str)); } 
    catch { return null }
};

export const getStatusLabel = (value: string) => {
  if(value){
    return PROPERTY_STATUS.find(item => item.value == value)?.name
  }
  return ''
}
export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  try{
    await fetch("/api/set-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    });
  }catch(error){
    console.error("Failed to set auth cookies:", error);
  }
}

export const clearAuthCookies = async () => {
  try {
    await fetch("/api/clear-token", {
      method: "POST",
    });
  } catch (error) {
    console.error("Failed to clear cookies:", error);
  }
};

export function joinUrl(
  base?: string | null,
  path?: string | null
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!base) return null;

  const safeBase = base.replace(/\/+$/, "");
  const safePath = path.replace(/^\/+/, "");
  return `${safeBase}/${safePath}`;
}

export function numberToWordsIndian(num) {
  if(!num) return ''
  if (num === 0) return "Zero Rupees";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = Math.floor(num / 100);
  num %= 100;

  if (crore) result += twoDigits(crore) + " Crore ";
  if (lakh) result += twoDigits(lakh) + " Lakh ";
  if (thousand) result += twoDigits(thousand) + " Thousand ";
  if (hundred) result += ones[hundred] + " Hundred ";
  if (num) result += twoDigits(num) + " ";

  return result.trim() + " Rupees";
}
