export const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const UNSIGNED_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

type UploadResult = {
  secure_url: string;
  width: number;
  height: number;
  public_id: string;
};

export async function uploadToCloudinary(localUri: string): Promise<UploadResult> {
  const data = new FormData();
  // @ts-ignore react-native FormData
  data.append("file", { uri: localUri, type: "image/*", name: "upload.jpg" });
  data.append("upload_preset", UNSIGNED_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: data as any,
  });

  if (!res.ok) throw new Error(`Cloudinary upload failed ${res.status}`);
  return res.json();
}

// optional on-the-fly thumbnail (faster grid):
export function thumb(url: string, w = 600) {
  // turns .../upload/v123/abc.jpg → .../upload/c_fill,w_600,q_auto,f_auto/abc.jpg
  return url.replace("/upload/", `/upload/c_fill,w_${w},q_auto,f_auto/`);
}
