# Contact form — one-time setup (do this once, in the browser)

The code is fixed, but the contact form deliberately stays "temporarily
unavailable" until **you** connect it to a real email destination. There are two
tasks. Task 1 is required. Task 2 (spam protection) is optional but recommended.

You do all of this in a web browser — there is no code to write.

---

## Task 1 — Connect the form to your inbox (REQUIRED)

This uses **FormSubmit**, a free service that emails you each submission.

### Step 1: Get your FormSubmit address activated

1. Open a new browser tab and go to **https://formsubmit.co**
2. You do **not** need to register. Instead, you'll activate your email by
   sending one test submission. The easiest way:
   - Go to **https://formsubmit.co/live-demo**
   - In the demo form, replace the sample email with **mail@casagar.co.in**
     (the firm's contact inbox).
   - Submit the demo form once.
3. Open the **mail@casagar.co.in** inbox. You'll receive an email from
   FormSubmit titled something like _"Confirm your email"_.
4. Click the **Confirm** / **Activate** button inside that email.
   - This one-time click is what "activates" the address. Until you click it,
     FormSubmit refuses to forward anything — this is the single most common
     reason a form "silently fails".

### Step 2: Choose your endpoint (privacy tip)

FormSubmit gives you two ways to address your form:

- **Simple (exposes the email):**
  `https://formsubmit.co/ajax/mail@casagar.co.in`
- **Private (recommended):** a random alias that hides the real email. After
  you confirm in Step 1, FormSubmit's confirmation email (and your FormSubmit
  dashboard) shows a **unique random string** for your address. Your endpoint is
  then:
  `https://formsubmit.co/ajax/xxxxxxxxxxxxxxxx`
  (where `xxxxxxxxxxxxxxxx` is that random string).

Either works. The private alias is better because it keeps your email address
out of the website's code. **Copy whichever endpoint you choose** — you'll paste
it in Step 3.

> Note the `/ajax/` in the URL. Our form talks to FormSubmit in the background
> (so visitors never leave your site), and that requires the **ajax** version of
> the endpoint. Don't use a plain `https://formsubmit.co/...` address without
> `/ajax/`.

### Step 3: Tell Netlify the endpoint

1. Go to **https://app.netlify.com** and sign in.
2. Click your site (the casagar.co.in project).
3. In the top menu, click **Site configuration** (older UI: **Site settings**).
4. In the left menu, click **Environment variables**.
5. Click **Add a variable** → **Add a single variable**.
6. Fill in:
   - **Key:** `FORM_SUBMIT_ENDPOINT`
   - **Value:** the endpoint you copied in Step 2 (the full `https://formsubmit.co/ajax/...` URL)
   - **Scopes:** leave the default (all scopes) — or at minimum tick
     **Functions** and **Builds**.
7. Click **Create variable** / **Save**.

### Step 4: Re-deploy so the change takes effect

Environment variables only apply to **new** deploys.

1. In Netlify, go to the **Deploys** tab.
2. Click **Trigger deploy** → **Deploy site** (or **Clear cache and deploy site**).
3. Wait for the deploy to finish (usually 1–3 minutes).

### Step 5: Test it

1. Open **https://casagar.co.in/contact** in your browser.
2. Fill in the form with your own details and send it.
3. You should see "Message sent successfully!" and receive the email at
   **mail@casagar.co.in** within a minute.
4. If it still says "temporarily unavailable", the deploy hasn't picked up the
   variable yet — re-check Step 3 for typos (it must be exactly
   `FORM_SUBMIT_ENDPOINT`) and re-deploy.

---

## Task 2 — Turn on spam protection (OPTIONAL, recommended)

This uses **Botpoison**, a free-tier service that quietly blocks spam bots. The
form works fine without it, but you'll get less junk with it on.

> **Important:** Botpoison uses **two** keys that must **both** be present, or
> **both** be absent. If only one is set, the form will reject every message.
> So either complete all steps below, or skip this task entirely.

### Step 1: Create a Botpoison form

1. Go to **https://botpoison.com** and sign up (free tier is fine).
2. Create a new **form**/**project** for casagar.co.in.
3. It will give you two keys:
   - A **Public key** starting with `pk_...`
   - A **Secret key** starting with `sk_...`
4. Copy both.

### Step 2: Add both keys to Netlify

Repeat the Netlify "Environment variables" steps (Task 1, Step 3) **twice**:

| Key                         | Value                    |
| --------------------------- | ------------------------ |
| `VITE_BOTPOISON_PUBLIC_KEY` | your `pk_...` public key |
| `BOTPOISON_SECRET_KEY`      | your `sk_...` secret key |

- The `VITE_` one **must** have that exact prefix — it's the one baked into the
  website at build time.
- Make sure the **Builds** scope is ticked for `VITE_BOTPOISON_PUBLIC_KEY`
  (it's needed when the site is built), and **Functions** for the secret key.

### Step 3: Re-deploy and test

Same as Task 1, Steps 4–5: **Trigger deploy**, wait, then send a test message
from the contact page. If it goes through, spam protection is live.

---

## Quick reference — what each variable does

| Variable                    | Required?  | Purpose                                             |
| --------------------------- | ---------- | --------------------------------------------------- |
| `FORM_SUBMIT_ENDPOINT`      | **Yes**    | Where submissions are emailed (your FormSubmit URL) |
| `VITE_BOTPOISON_PUBLIC_KEY` | Optional\* | Front-end half of spam protection                   |
| `BOTPOISON_SECRET_KEY`      | Optional\* | Back-end half of spam protection                    |

\* Optional, but if you set one Botpoison key you **must** set the other.

If you get stuck on any step, tell me which step number and what you see on
screen, and I'll talk you through it.
