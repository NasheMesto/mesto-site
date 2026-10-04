# Scary House public page

The main website is a static GitHub Pages site. `events/scary-house-2026-10-31.html` uses
`data-checkout-mode="payment-link"` and sends buyers to the existing live Stripe
Payment Link. This mode makes no requests to the private ticket API and does not
load an embedded test form. English is the default; the RU choice persists in the
URL. The purchase link works with JavaScript disabled.

Each event gets a page under `events/` named for the event and its date.
Scary House uses `/events/scary-house-2026-10-31.html`; `#tickets` opens the
ticket section. The old `/tickets.html` redirects there, preserving query
parameters and translating the old `#embedded-payment` anchor to `#tickets`.

The local ticket service uses the same UI with `data-checkout-mode="auto"`.
Its current embedded checkout is test-only. Keep it separate from the public
website until the server, email, webhook and live integration are ready.
Payment Link purchases are managed in Stripe and do not automatically appear in
the local guest panel.

Public UI and schedule importer checks:

```sh
node --test tools/event-url.test.mjs tools/tickets-ui.test.mjs tools/sync-todo.test.mjs
```

Publish only website files. Never add local `.env` files, database files, server
handoff archives or the `output/` and `tmp/` directories to a Pages release.
