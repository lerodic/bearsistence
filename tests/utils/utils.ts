export function getPlistLabel(scheduleName: string): string {
  return `com.bearsistence.${scheduleName.toLowerCase().replace(" ", "-")}`;
}

export function getPlistPath(scheduleName: string): string {
  const name = getPlistLabel(scheduleName);

  return `/Users/test/Library/LaunchAgents/${name}.plist`;
}
