export const PHONE_CODE_REGEX = /^\+\d{1,4}$/;
export const PHONE_CODE_PATTERN_DESC = '+966';

// Allows for commas, periods, and single quotes in the English description
export const ENGLISH_NAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9\s\-',.]+$/;

// Allows for Arabic commas (،), regular commas (,), and periods (.) in the Arabic description
export const ARABIC_NAME_REGEX =
  /^(?=.*[\u0600-\u06FF])[ءاأإآىئوة\u0600-\u06FF0-9\s\-،,.]+$/;
