import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadFiles(pathPrefix: string, files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const uploads = files.map(async (file) => {
    const filePath = `${pathPrefix}/${Date.now()}_${sanitizeFileName(file.name)}`;
    const fileRef = ref(storage, filePath);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  });

  return Promise.all(uploads);
}
