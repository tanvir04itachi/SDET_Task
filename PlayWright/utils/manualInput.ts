import { expect, Locator, Page } from '@playwright/test';

/** How long the run waits for a human to type an OTP or paste a link (headed mode only). */
export const MANUAL_TIMEOUT_MS = 5 * 60_000;

/** Waits for the person running the test to type a 4-digit OTP into the real OTP field. */
export async function waitForTypedOtp(page: Page, otpInput: Locator, email: string): Promise<void> {
  console.log(`\n>>> Type the 4-digit OTP sent to ${email} into the browser (waiting up to 5 min)...`);
  await otpInput.focus();
  await expect(otpInput).toHaveValue(/^\d{4}$/, { timeout: MANUAL_TIMEOUT_MS });
}

/**
 * Shows a paste box on top of the current page and resolves with what the person pastes.
 * Used for the password-reset link, which only arrives by email.
 */
export async function askInBrowser(page: Page, message: string, valid: RegExp = /.+/): Promise<string> {
  console.log(`\n>>> ${message} (paste it into the box in the browser, waiting up to 5 min)...`);
  await page.evaluate(({ msg, source, flags }) => {
    const pattern = new RegExp(source, flags);
    const box = document.createElement('div');
    box.id = 'pw-manual-input';
    box.style.cssText =
      'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;background:#fff;color:#111;' +
      'padding:16px;border:3px solid #6366f1;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);' +
      'font:14px sans-serif;width:min(640px,92vw)';
    box.innerHTML =
      `<div style="font-weight:700;margin-bottom:8px">${msg}</div>` +
      '<input id="pw-manual-value" style="width:100%;padding:8px;font-size:14px;box-sizing:border-box" placeholder="Paste here">' +
      '<button id="pw-manual-ok" style="margin-top:8px;padding:8px 16px;font-weight:700">Submit</button>' +
      '<div id="pw-manual-error" style="color:#c62828;margin-top:6px"></div>';
    document.body.appendChild(box);
    const submit = () => {
      const value = (document.getElementById('pw-manual-value') as HTMLInputElement).value.trim();
      // Reject wrong pastes (e.g. a stale clipboard) and keep waiting instead of failing the run.
      if (!pattern.test(value)) {
        document.getElementById('pw-manual-error')!.textContent = 'That does not look right — please paste it again.';
        return;
      }
      (window as any).__pwManualValue = value;
    };
    document.getElementById('pw-manual-ok')!.addEventListener('click', submit);
    document.getElementById('pw-manual-value')!.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
    document.getElementById('pw-manual-value')!.focus();
  }, { msg: message, source: valid.source, flags: valid.flags });

  const handle = await page.waitForFunction(() => (window as any).__pwManualValue, undefined, {
    timeout: MANUAL_TIMEOUT_MS,
    polling: 500,
  });
  const value = (await handle.jsonValue()) as string;
  await page.evaluate(() => {
    document.getElementById('pw-manual-input')?.remove();
    delete (window as any).__pwManualValue;
  });
  return value;
}
