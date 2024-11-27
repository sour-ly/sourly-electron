type AsyncFunction = (...args: any[]) => Promise<any>;

export const createWaitFunction = async (
  promise: Promise<any>,
  fcallback: AsyncFunction,
) => {
  await promise;
  await fcallback();
};
