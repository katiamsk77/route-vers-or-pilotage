<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Business rules (prices, follow-up dates, streak, ranks, stages) live in src/lib/business.ts with tests beside it; keep UI free of these calculations.
- Signed-in pages live under src/routes/_authenticated/ (client-only gate); data is read directly with the browser client and protected by row-level security.
- The first account created automatically gets the admin role (signup trigger); shared content tables are admin-write, everyone-read.
