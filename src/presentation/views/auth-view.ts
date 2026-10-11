import { escapeHtml, renderLayout } from "./layout";

export function renderSignInPage(errorMessage: string | null): string {
  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";
  const content = `
    <form class="form-card" method="post" action="/auth/sign-in">
      <h2>Sign in</h2>
      ${errorBlock}
      <div class="form-field">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required>
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Sign in</button>
      </div>
      <p class="form-hint">New here? <a href="/auth/sign-up">Create an account</a></p>
    </form>`;
  return renderLayout("Sign in", content);
}

export function renderSignUpPage(errorMessage: string | null): string {
  const errorBlock = errorMessage
    ? `<div class="error-message">${escapeHtml(errorMessage)}</div>`
    : "";
  const content = `
    <form class="form-card" method="post" action="/auth/sign-up">
      <h2>Create an account</h2>
      ${errorBlock}
      <div class="form-field">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required
               minlength="3" maxlength="30" pattern="[a-zA-Z0-9_-]+">
        <p class="form-hint">3-30 characters: letters, numbers, underscores, hyphens.</p>
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required minlength="8">
        <p class="form-hint">At least 8 characters.</p>
      </div>
      <div class="actions">
        <button class="arkham-button" type="submit">Create account</button>
      </div>
      <p class="form-hint">Already have an account? <a href="/auth/sign-in">Sign in</a></p>
    </form>`;
  return renderLayout("Create account", content);
}
