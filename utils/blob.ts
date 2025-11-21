export const uriToBlob = async (uri: string) => {
  try {
    console.log(uri);
    const response = await fetch(uri);
    console.log("BLOB: ", response);
    const blob = await response.blob();
    console.log("THE ACTUAL BLOB", blob);
    return blob;
  } catch (error) {
    console.log(error);
    return null;
  }
};
