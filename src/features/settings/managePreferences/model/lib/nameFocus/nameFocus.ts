let isRequested = false;

export const requestNameFocus = (): void => {
  isRequested = true;
};

export const consumeNameFocusRequest = (): boolean => {
  const wasRequested = isRequested;
  isRequested = false;
  return wasRequested;
};