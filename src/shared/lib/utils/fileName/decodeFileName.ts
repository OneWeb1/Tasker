export const decodeFileName = (name: string): string => {
  if (!name.includes('%')) return name;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};