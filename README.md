# Coaching Assignments

A Cubs affiliate staffing whiteboard. Run `npm start`, then open http://localhost:3948. Node.js 20+ is required. No package installation is needed. Run `npm test` for assignment and import validation checks.

## Using the board

- Add candidates and their titles. Drag nameplates into affiliate positions, or click a card and use the Board position menu (also works with touch and keyboard).
- Keep multiple candidates in each position; mark one final choice per position.
- Create empty scenarios or duplicate an existing plan to explore alternatives. Candidate details and position titles are shared across scenarios; placements, final choices, notes, and activity belong to individual scenarios.
- Add leadership profiles and select the person making changes. Moves and opinions record the selected name.
- Export/import JSON to transfer the complete board. Import replaces the current board after confirmation.

## Storage and collaboration

This first version stores data in localStorage on the current browser and origin. Profiles are attribution labels, not authenticated accounts. Separate browsers synchronize while connected to the same live session. Outside a live session, edits stay local. Export backups before changing browsers or importing another board. Imported and exported boards contain candidate names and opinions.

The repository includes the user-provided starting roster (managers and bench coaches). Subsequent browser edits are stored locally and are not committed. Published through GitHub Pages under mttalarico/coaching-assignments. This is a lightweight brainstorming tool with optional live peer-to-peer sessions. No authenticated accounts or hosted board database are required.

## Affiliates

AAA Iowa Cubs, AA Knoxville Smokies, A+ South Bend Cubs, A Myrtle Beach Pelicans, AZL Arizona Cubs, plus a Roving Coaches column for staff working across affiliates. Roving Coaches supports the same positions, candidate options, final selections, and live updates as the affiliate columns. Assets copied from the user's Leaderboard Master 2000 app. Arizona uses the Cubs mark. Initial titles are editable: Manager, Hitting Coach, Pitching Coach, Development Coach.

The starting roster is applied once per saved board. Empty boards receive it directly; existing work is preserved and a separate Last year's roster scenario is added. All ten assignments remain open for discussion.

## GitHub Pages publishing

Target repository: `mttalarico/coaching-assignments`.
Website: https://mttalarico.github.io/coaching-assignments/

Create the repository, push this project to its main branch, then select **Settings → Pages → Source → GitHub Actions**. Run the **Publish coaching board** workflow (or push another change). The workflow runs `npm run build` (no dependency installation needed) and publishes `dist/`, generated from `public/`. Every module import, entry script, and stylesheet gets one content-based cache version so a refresh loads a consistent release.

The website starts everyone with the provided roster. Use Live session → Start live session → Copy invite link to edit together, or Export board / Import board to exchange copies. The public site includes the starting roster. The noindex tag discourages search indexing but does not restrict access.

## Live brainstorming

1. The host opens the website and clicks **Live session → Start live session**.
2. Click **Copy invite link** and send that link to a partner.
3. The partner opens it, enters a name/nickname, and clicks **Join live session**.
4. Changes to candidates, placements, scenarios, notes, titles, and profiles synchronize. Each participant can view any scenario; choose the same scenario tab to see the same arrangement.

Keep the host tab open. Closing it or choosing Leave session ends the session; start a new session and send a fresh link next time. Refreshing the same host tab resumes its session ID; partners can use Retry connection when the host is back. A heartbeat detects lost connections and pauses guest edits. Some restricted networks block WebRTC; use another network or exchange exported boards if connection fails. This is live collaboration while the host is online, not an always-online shared database.

PeerJS 1.5.5 is vendored in `public/vendor/` with its MIT license. Its public signaling service connects participants; board content travels through WebRTC data channels. Anyone holding the invite link can join and edit. Session IDs are random and carried in the invite query parameter. Older fragment-style invites remain supported. Profile names are attribution labels, not verified identities.

The host saves the shared result in their local board. Guests save the session under a separate browser-storage key; their personal board is restored when they leave. Export a session copy before leaving if you want to keep it as a file. Simultaneous independent edits are merged against their common starting state. Conflicting edits to the same item are rejected visibly, preserving the unsent draft for export. Forms opened before a remote update must be reopened before saving to prevent stale edits.

### Checks

`npm test` checks board validation, assignment rules, and concurrent merging. After `npm ci`, `node scripts/check-live.mjs` runs two isolated Chrome sessions using fictional data against the local server and the real signaling service. The script currently uses the macOS Chrome executable path. Tests do not alter a user's browser storage. The browser check covers joining, profile attribution, candidate addition, moves, opinions, scenarios, and disconnect handling.

## Roster reactions

Each scenario has Like 👍, Dislike 👎, Love ❤️, Fire 🔥, Sick 🤘, and Thinking 🤔 reactions. Select your leadership profile, then click one or more emojis. Click again to remove your reaction. Counts and names are visible to everyone in the live session, and scenario tabs show a reaction summary. Reactions stay with a scenario as it is edited; duplicating it starts fresh feedback. Reactions are included in exports and local/session saves. Older boards without reactions remain supported.

## Position feedback and release options

Whole-roster reactions remain above the board. Click **React** inside a position slot (for example, Iowa · Manager) to react specifically to that position's options. The feedback dialog shows each person's reactions, updates during live sessions, and lets you click again to remove your own reaction. Counts appear in that slot; they do not affect whole-roster reaction totals. Removing a position title clears feedback for the removed slot. Duplicated scenarios start with fresh feedback at both levels.

The **Release** column is a single scenario-specific list of names under consideration. Drag a name there or select **Release — Under consideration** in its card editor. Move it back to an affiliate or Roving Coaches at any time. Release does not delete the person from the candidate list or affect other scenarios, does not count as a staffing position, and cannot be marked as a filled position. Its React button supports feedback on the release options together. Both features are included in exports and live updates.

## Invite troubleshooting

Invites copied from localhost now point to the published website, so partners can open them on their own computers. Open the invitation, or click **Join session** and paste the full link or its `coaching-...` session code. Both new query-style and older fragment-style invites are recognized, including when opening an old invite in an already-open tab.

Keep the host's tab open. The same tab remembers its host session ID across refreshes using sessionStorage. If disconnected, click **Retry connection** after the host has returned. Closing the host tab or explicitly leaving ends the session. Errors distinguish an offline host from an unavailable connection service or an unsupported browser. These fixes do not guarantee connectivity on networks that block WebRTC or the signaling service.

`node scripts/check-invites.mjs` checks public invite generation from localhost, legacy invites in existing tabs, manual joining, refresh/retry, and offline-host errors using fictional data. Set `BOARD_URL=https://mttalarico.github.io/coaching-assignments/` to check the deployed site in isolated browsers.

Live sessions now exchange protocol version 2. If either browser is running an older app, participants must refresh both pages and reconnect; incompatible data is not silently accepted. A rejected incoming snapshot produces a persistent explanation and Retry control instead of a transient invalid-update toast. No local boards are cleared by this update.
