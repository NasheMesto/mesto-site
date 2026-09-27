# Todo.Today schedule

The Events page reads `data/events.json`. `node tools/sync-todo.mjs` refreshes it using the public channel's current nonce and paginated read-only event request. No Todo login or third-party packages are needed. The endpoint is not a documented public API and may change.

GitHub Actions → **Update events from Todo** → **Run workflow**, branch **main**, is the manual refresh control. GitHub restricts this action to repository users with write access; it is not a visitor-facing button or strictly an admin-role-only permission. Do not grant repository write access to ordinary visitors. Scheduled refresh: Sunday 23:00 UTC / Monday 06:00 Bangkok, subject to GitHub scheduling delays. Scheduled workflows in inactive public repositories may be disabled by GitHub after 60 days without activity.

The workflow commits only the completed data file and explicitly requests a GitHub Pages build (bot commits alone do not trigger Pages). It assumes Pages publishes from main / root. Check this in repository Settings → Pages before enabling. A failed request or incomplete pagination preserves the previous file; a successful empty response clears the schedule. The public page hides ended events and warns when its data is over eight days old. Changes and cancellations between refreshes require a manual run.

Validation: `node --test tools/sync-todo.test.mjs`. Before considering setup complete, run the workflow on GitHub, check the Pages build, and verify the published Events page. Local download success does not prove the endpoint allows GitHub runner traffic.
