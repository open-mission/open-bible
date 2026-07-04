// Main component
export { VersionPickerDialog } from "./version-picker-dialog";

// Bible version context
export { useBibleVersion } from "@/features/bible-reader/context/bible-version-context";

// Tab content components
export { InstalledVersionsTab } from "./installed-versions-tab";
export { AvailableVersionsTab } from "./available-versions-tab";

// Other exports
export { VersionRow } from "./version-row";
export { filterVersions, getVersionSize, getNotInstalledAvailable } from "./version-meta";
export type { VersionMeta, AvailableVersion } from "@/features/bible-reader/context/bible-version-context";