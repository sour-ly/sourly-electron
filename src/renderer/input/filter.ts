type NumericalInputFilterProps = {
  min?: number;
  max?: number;
  allowNaN?: boolean;
  defaultValue?: number;
};

export function NumberInputFilter(
  e: string,
  options?: NumericalInputFilterProps,
) {
  const value = parseInt(e);
  if (isNaN(value) && !options?.allowNaN) {
    return options?.defaultValue || 0;
  }
  if (options?.min && value < options.min) {
    return options.min;
  }
  if (options?.max && value > options.max) {
    return options.max;
  }
  return value;
}

type DisplayNumberProps = {
  defaultValue?: string;
};

export function DisplayNumber(value: number, options?: DisplayNumberProps) {
  if (isNaN(value) || value === null) {
    return options?.defaultValue || 0;
  }
  return value;
}

// object should be a object with keys
export function RemoveNANFromObject(obj: any, defaultValue: number = 0) {
  const copy = { ...obj };
  Object.keys(obj).forEach((key) => {
    if (typeof copy[key] === 'number' && isNaN(copy[key])) {
      copy[key] = defaultValue;
    } else if (typeof copy[key] === 'object') {
      copy[key] = RemoveNANFromObject(copy[key], defaultValue);
    }
  });
  return copy;
}
