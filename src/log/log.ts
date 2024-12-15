export namespace Log {
  export function log(
    source: string,
    severity: 0 | 1 | 2,
    message: string,
    ...args: any[]
  ) {
    let severityString = '';
    switch (severity) {
      case 0:
        severityString = 'log';
        break;
      case 1:
        severityString = 'warn';
        break;
      case 2:
        severityString = 'error';
        break;
    }

    if (typeof console[severityString as keyof Console] === 'function') {
      // @ts-ignore
      console[severityString as keyof Console](
        `[${source}] ${message}`,
        ...args,
      );
    }
  }

  export function assert(
    condition: boolean,
    source: string,
    message: string,
    ...args: any[]
  ) {
    console.assert(condition, `[${source}] ${message}`, ...args);
  }
}
