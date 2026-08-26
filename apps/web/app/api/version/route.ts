import { getAppVersion } from "@/lib/release-notes/version";

export async function GET() {
  return Response.json({
    version: getAppVersion(),
    changelogUrl: "/changelog",
  });
}
