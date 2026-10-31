# UtiliHub

Pequenas ferramentas. Grandes facilidades.

UtiliHub is a responsive collection of free browser-based utilities. The first release includes a word counter, percentage calculator, unit converter, JSON formatter, text case converter and a local password-strength checklist.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Deploy to GitHub Pages

1. Open the repository settings.
2. Go to **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes the site whenever code is pushed to `main`.

## Privacy and limitations

The tools in this release process their inputs in the browser. Do not enter confidential information. The password checklist is educational and is not a security audit. Conversion and percentage results should be checked before being used in important decisions.

The legal and contact information must be reviewed and completed by the site owner before public commercial use. No advertising network is integrated and no approval or revenue is guaranteed.

## Technology

React, Vite and Lucide icons.