# DebtShark

DebtShark is a private, local-only organizer for reviewing loan offers, planning repayment, tracking servicing activity, preparing a factual case summary, and learning about borrower protections.

## Privacy

- No accounts, analytics, servers, or cloud sync.
- Entries are saved only in the browser on the current device.
- Clearing browser or site data, using private browsing, or changing devices can remove saved records.
- Exports happen only when a person explicitly chooses to export a case packet.

DebtShark is educational planning support, not legal, financial, or tax advice. It cannot determine rights, deadlines, or what someone should do in a particular case.

## Use locally

Serve the `dist` folder with any static HTTP server. For example:

```sh
npx serve dist
```

## Publish to GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. After pushing `main`, open **Settings → Pages** in GitHub and set **Source** to **GitHub Actions**. The workflow publishes `dist` as a static site.

All application paths are relative, so the PWA works from a GitHub Pages project subpath such as `https://username.github.io/debtshark/`.

## Browser support

Designed for current Chrome, Edge, Safari, iPhone, and Android browsers. Install support is browser-dependent; the app continues to work in the browser when an install prompt is unavailable.
