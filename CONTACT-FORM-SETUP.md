# Contact and careers forms — how they send email

Both forms send each submission to **FormSubmit** (https://formsubmit.co), a free
service that emails it to **mail@casagar.co.in**. The visitor's browser sends it
directly; there is no server in between, because FormSubmit refuses requests
that come from hosting servers.

- Code: `utils/formSubmit.ts` (the send) and `config/contact.ts` (the address).
- Spam: FormSubmit's own filter, plus a hidden `_honey` field that bots fill in
  and people don't. Each form also limits how often one visitor can send.

## The address is already activated

FormSubmit only delivers to an address after a one-time activation: the first
message sends an "Activate Form" email, and nothing is delivered until that
link is clicked. mail@casagar.co.in has been activated, so nothing more is
needed.

If you ever change the address, send one test message from the website, click
the activation link that arrives at the new address, and send another test.

## Optional: hide the email address from the website's code

The form currently posts to `https://formsubmit.co/ajax/mail@casagar.co.in`, so
the address is visible in the site's code (it is already shown on the Contact
page). FormSubmit's activation email also gives a random alias. To use it:

1. In Netlify, open **Site configuration → Environment variables** and add
   `VITE_FORM_ENDPOINT` = `https://formsubmit.co/ajax/<the random alias>`.
2. Open **Deploys → Trigger deploy → Deploy site** so the change is built in.
3. Send a test message from casagar.co.in/contact.

## If a message does not arrive

- The site shows "We could not send your message": FormSubmit refused it. The
  usual reason is that the address needs activating again; check
  mail@casagar.co.in (and spam) for an email from FormSubmit.
- Nothing arrives and no error shows: check the spam folder, then FormSubmit's
  status page.
