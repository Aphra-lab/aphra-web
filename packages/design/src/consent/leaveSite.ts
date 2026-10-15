export interface LeaveSiteWindow {
  document: { referrer: string };
  history: { length: number; back: () => void };
  location: { origin: string; replace: (url: string) => void };
}

function cameFromAnotherSite(win: LeaveSiteWindow) {
  if (!win.document.referrer) return false;
  try {
    return new URL(win.document.referrer).origin !== win.location.origin;
  } catch {
    return false;
  }
}

export function leaveSite(
  exitUrl = 'about:blank',
  win: LeaveSiteWindow = window,
) {
  if (cameFromAnotherSite(win) && win.history.length > 1) {
    win.history.back();
    return;
  }
  win.location.replace(exitUrl);
}
