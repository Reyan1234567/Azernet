import { File } from "expo-file-system";

export const uriToBlob = (fileUri: string): Blob => {
  const file = new File(fileUri);
  return file.arrayBuffer as unknown as Blob;
};
