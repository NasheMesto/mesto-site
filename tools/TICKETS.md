# Scary House public page

The main website is a static GitHub Pages site. `tickets.html` uses
`data-checkout-mode="payment-link"` and sends buyers to the existing live Stripe
Payment Link. This mode makes no requests to the private ticket API and does not
load an embedded test form. English is the default; the RU choice persists in the
URL. The purchase link works with JavaScript disabled.

The local ticket service uses the same UI with `data-checkout-mode="auto"`.
Its current embedded checkout is test-only. Keep it separate from the public
website until the server, email, webhook and live integration are ready.
Payment Link purchases are managed in Stripe and do not automatically appear in
the local guest panel.

Public UI and schedule importer checks:

```sh
node --test tools/tickets-ui.test.mjs tools/sync-todo.test.mjs
```

Publish only website files. Never add local `.env` files, database files, server
handoff archives or the `output/` and `tmp/` directories to a Pages release.
