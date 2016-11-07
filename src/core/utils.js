export const arr = a => Array.isArray(a) ? a : [a];
export const objectValues = obj => Object.keys(obj).map(key => obj[key]);
