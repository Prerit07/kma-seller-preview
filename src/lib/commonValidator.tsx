import { UserType } from "@/types/user";
import { USER_TYPE } from "./enums";

export function matchIsString(text: unknown): text is string {
  return typeof text === 'string';
}

export function matchIsNumeric(text: unknown): boolean {
  const isNumber = typeof text === 'number';
  const isString = matchIsString(text);
  return (isNumber || (isString && text !== '')) && !isNaN(Number(text));
}

export function mobileNumberValidator(text: string): string {
  if(!text){
    return 'Mobile number is required.'
  }else if(text.length != 10 || text.length > 10){
    return 'Mobile number length should be 10 digit.'
  }
  return ''
}

export function validateAndRedirect(searchParams: URLSearchParams): boolean {
  const mobileNumber = searchParams.get('mobile');
  const ownerType = searchParams.get('ownerType');

  // Validate mobile number: exactly 10 digits
  const isValidMobile = /^\d{10}$/.test(mobileNumber ?? '');

  // Validate ownerType: must be one of the values from USER_TYPE
  const isValidOwnerType = Object.values(USER_TYPE).includes(ownerType as UserType);

  if (!isValidMobile || !isValidOwnerType) {
    window.location.href = '/signup';
    return false;
  }

  return true;
}