import React from "react";

type ExpectedInput<T> = React.Dispatch<React.SetStateAction<T>>;

export function useStateUtil<T extends object>(setState: ExpectedInput<T>): (key: keyof T, value: T[keyof T]) => void {
  return React.useCallback((key: keyof T, value: T[keyof T]) => {
    _setState(setState, key, value);
  }, [setState]);
}

function _setState<T extends object>(setState: ExpectedInput<T>, key: keyof T, value: T[keyof T]) {
  setState((state) => {
    return {
      ...state,
      [key]: value
    }
  })
}
