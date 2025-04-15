export const logError = (error: unknown) => {
    console.log((error as Error).message)
}