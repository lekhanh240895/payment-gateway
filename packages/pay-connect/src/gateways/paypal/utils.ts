export async function handleResponse(response: Response) {
  if (response.status === 204) {
    return {
      jsonResponse: null,
      httpStatusCode: response.status,
    }
  }

  try {
    const jsonResponse = await response.json()
    return {
      jsonResponse,
      httpStatusCode: response.status,
    }
  } catch (err) {
    const errorMessage = await response.text()
    throw new Error(errorMessage)
  }
}
