export const sleep = async (msInterval: number): Promise<void> => {
  return await new Promise((resolve) => setTimeout(resolve, msInterval))
}
