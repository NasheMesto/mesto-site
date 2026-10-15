# Scary House public page

The main website is a static GitHub Pages site. Scary House uses
`data-checkout-mode="manager"` and `assets/js/manager-checkout.js` to load the reusable
window from `https://manager.nashemesto.com/ticket-embed.js`. Its event ID is declared
on `#manager-checkout`; prices, quantities, inventory, payment confirmation and QR
delivery are owned by the manager. Merely opening the page does not reserve seats.
English is the default; the surrounding page also supports Russian.

The separate-window fallback uses the same manager event. If this browser already
has an order token, it passes that token in a fragment to resume the existing order,
without copying buyer details or Stripe client secrets. Telegram is the alternative
when payment fails. Card and PromptPay are enabled for Live sales. JavaScript is required for online payment.

The original Scary House Payment Link is no longer offered on this page. It is kept
active in Stripe for existing sessions and reconciliation. Purchases on that old
link remain a separate import with email held for manual review. New manager orders
have no Payment Link and do not enter that import. Repeated webhook/polling requests
reuse the same order and delivery record. An intentional resend still needs a reason.
No import or manual resend is triggered by this static website.

Each event gets a page under `events/` named for the event and its date.
Scary House uses `/events/scary-house-2026-10-31.html`; `#tickets` opens the
ticket section. The old `/tickets.html` redirects there, preserving query
parameters and translating the old `#embedded-payment` anchor to `#tickets`.

The legacy local ticket service uses `data-checkout-mode="auto"` and remains
test-only. It is separate from the production manager and must not replace the
manager checkout used by the public page.

Public UI and schedule importer checks:

```sh
node --test tools/event-url.test.mjs tools/tickets-ui.test.mjs tools/manager-checkout.test.mjs tools/sync-todo.test.mjs
```

Publish only website files. Never add local `.env` files, database files, server
handoff archives or the `output/` and `tmp/` directories to a Pages release.
