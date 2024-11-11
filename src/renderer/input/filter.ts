type NumericalInputFilterProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
}

export function NumberInputFilter(e: string, options?: NumericalInputFilterProps) {
  let value = parseInt(e);
  if (isNaN(value)) {
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
