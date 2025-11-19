export const uriToBlob = async (uri: string) => {
  try {
    // Use the polyfilled fetch to read the local file
    const response = await fetch(uri);
    // Convert the response to a Blob
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.log(error);
    return null;
  }
};
