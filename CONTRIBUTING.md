# Contributing to DebtShark

Thank you for helping make DebtShark clearer, safer, and more useful.

## Before you start

Open an issue before substantial work so the idea can be discussed. Small documentation fixes and focused UI improvements are welcome as pull requests.

Never include real borrower information, account numbers, notices, addresses, court documents, or other sensitive material in issues, pull requests, screenshots, or commits. Use invented examples only.

## Local preview

DebtShark is a static app. From the repository root, run:

```sh
python3 -m http.server 4173 --directory dist
```

Then open `http://localhost:4173` in a current browser.

## Pull-request checklist

- Keep the experience local-only: no accounts, analytics, tracking, or remote data storage.
- Preserve the app’s plain-language, non-alarmist tone.
- Check desktop and mobile layouts, keyboard focus, and reduced-motion behavior when relevant.
- Do not make claims that sound like legal, financial, or tax advice.
- Explain what changed and how you tested it.

By contributing, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

