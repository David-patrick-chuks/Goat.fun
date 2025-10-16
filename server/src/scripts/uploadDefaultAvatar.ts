import fs from "fs";
import path from "path";
import { uploadLocalFile } from "../services/uploadService";

async function main(): Promise<void> {
  const localPath = path.resolve(path.join(__dirname, "..", "GOATFUNavatar.png"));
  if (!fs.existsSync(localPath)) {
    throw new Error(`Default avatar not found at ${localPath}`);
  }
  const res = await uploadLocalFile(localPath, "goatfun/defaults");
  // Print the URL so the user can copy it into DEFAULT_AVATAR_URL
  console.log(res.secure_url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

