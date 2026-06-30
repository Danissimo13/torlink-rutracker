import { spawn } from "node:child_process";

export function openUrl(url: string): Promise<boolean> {
  const [cmd, args] =
    process.platform === "win32"
      ? (["cmd", ["/c", "start", "", url]] as const)
      : process.platform === "darwin"
        ? (["open", [url]] as const)
        : (["xdg-open", [url]] as const);

  return new Promise((resolve) => {
    try {
      const proc = spawn(cmd, [...args], {
        stdio: "ignore",
        detached: true,
        windowsHide: true,
      });
      proc.on("error", () => resolve(false));
      proc.unref();
      setTimeout(() => resolve(true), 50).unref?.();
    } catch {
      resolve(false);
    }
  });
}
