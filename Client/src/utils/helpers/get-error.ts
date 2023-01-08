
export function getErrorResponse(result: { response: any, message: any }): Error {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    let returnValue = (result?.response?.data?.message || result?.message || "ocorreu um erro inesperado").trim();
    returnValue = capitalize(returnValue);
    console.error(returnValue + ": " + result?.response?.data?.detail ?? "");
    return { message: returnValue, name: "Error" };
}