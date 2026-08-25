const themeColors = {
  light: { chrome: "#fffaf3", statusBar: "default", manifest: "/manifest.webmanifest" },
  dark: { chrome: "#241917", statusBar: "black", manifest: "/manifest-dark.webmanifest" },
} as const;

export function updateThemeColor(theme: "light" | "dark"): void {
  const palette = themeColors[theme];
  let metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = palette.chrome;

  const manifestLink = document.getElementById("manifest-link") as HTMLLinkElement | null;
  if (manifestLink) manifestLink.href = palette.manifest;

  const appleStatusBar = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) appleStatusBar.content = palette.statusBar;
}
