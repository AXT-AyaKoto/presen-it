# Publishing checklist (maintainers)

## One-time setup: `NPM_TOKEN` secret

1. Open [npm Access Tokens](https://www.npmjs.com/settings/~/tokens) (or your org tokens page)
2. Create a token that can publish `@axt_ayakoto/presenit`:
    - **Granular Access Token** (recommended): permission to read/write the package (or the `@axt_ayakoto` scope)
    - Or classic **Automation** token (bypasses 2FA on publish; keep it secret)
3. In this GitHub repo:
    - **Settings → Secrets and variables → Actions → New repository secret**
    - Name: `NPM_TOKEN`
    - Value: the npm token

Trusted Publishing / OIDC can be added later; this workflow uses `NPM_TOKEN` + npm provenance (`id-token: write`).

## Every release

1. Bump versions in `package.json` and `src/pkg.ts`
2. Update `CHANGELOG.md`
3. Merge to `main`
4. GitHub → **Releases → Draft a new release**
    - Tag: `vX.Y.Z` (must equal `package.json` version)
    - Publish the release
5. Watch **Actions → Release**; npm publish runs automatically
