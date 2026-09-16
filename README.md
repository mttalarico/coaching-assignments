# Coaching Assignments

A Cubs affiliate staffing whiteboard. Run `npm start`, then open http://localhost:3948. Node.js 20+ is required. No package installation is needed. Run `npm test` for assignment and import validation checks.

## Using the board

- Add candidates and their titles. Drag nameplates into affiliate positions, or click a card and use the Board position menu (also works with touch and keyboard).
- Keep multiple candidates in each position; mark one final choice per position.
- Create empty scenarios or duplicate an existing plan to explore alternatives. Candidate details and position titles are shared across scenarios; placements, final choices, notes, and activity belong to individual scenarios.
- Add leadership profiles and select the person making changes. Moves and opinions record the selected name.
- Export/import JSON to transfer the complete board. Import replaces the current board after confirmation.

## Storage and collaboration

This first version stores data in localStorage on the current browser and origin. Profiles are attribution labels, not authenticated accounts. Separate browsers do not synchronize. Export backups before changing browsers or importing another board. Imported and exported boards contain candidate names and opinions.

The repository includes the user-provided starting roster (managers and bench coaches). Subsequent browser edits are stored locally and are not committed. Published through GitHub Pages under mttalarico/coaching-assignments. This is a lightweight brainstorming tool: each person works in their own browser copy and can export their ideas. Live synchronization and authenticated accounts are outside the current scope.

## Affiliates

AAA Iowa Cubs, AA Knoxville Smokies, A+ South Bend Cubs, A Myrtle Beach Pelicans, AZL Arizona Cubs. Assets copied from the user's Leaderboard Master 2000 app. Arizona uses the Cubs mark. Initial titles are editable: Manager, Hitting Coach, Pitching Coach, Development Coach.

The starting roster is applied once per saved board. Empty boards receive it directly; existing work is preserved and a separate Last year's roster scenario is added. All ten assignments remain open for discussion.

## GitHub Pages publishing

Target repository: `mttalarico/coaching-assignments`.
Website: https://mttalarico.github.io/coaching-assignments/

Create the repository, push this project to its main branch, then select **Settings → Pages → Source → GitHub Actions**. Run the **Publish coaching board** workflow (or push another change). The workflow publishes only `public/`.

The website starts everyone with the provided roster. Each browser has an independent working copy; use Export board / Import board to exchange ideas. The public site includes the starting roster. The noindex tag discourages search indexing but does not restrict access.
