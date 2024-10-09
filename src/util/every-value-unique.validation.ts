export const everyValueUnique = (arr: Array<string>): boolean => {
  const set = new Set(arr);
  return set.size === arr.length;
};
