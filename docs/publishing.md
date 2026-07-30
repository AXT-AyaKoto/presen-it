# 公開チェックリスト（メンテナ向け）

## 初回セットアップ: `NPM_TOKEN` シークレット

1. [npm Access Tokens](https://www.npmjs.com/settings/~/tokens)（または org のトークンページ）を開く
2. `@axt_ayakoto/presenit` を publish できるトークンを作る:
    - **Granular Access Token**（推奨）: パッケージ（または `@axt_ayakoto` スコープ）の read/write
    - または classic の **Automation** トークン（publish 時の 2FA を回避。厳重に保管すること）
3. この GitHub リポジトリで:
    - **Settings → Secrets and variables → Actions → New repository secret**
    - Name: `NPM_TOKEN`
    - Value: 上で作った npm トークン

Trusted Publishing / OIDC は後から足せる。現状の workflow は `NPM_TOKEN` + npm provenance（`id-token: write`）を使う。

## 毎回のリリース手順

1. `package.json` と `src/pkg.ts` のバージョンを上げる
2. `CHANGELOG.md` を更新する
3. `main` にマージする
4. GitHub → **Releases → Draft a new release**
    - Tag: `vX.Y.Z`（`package.json` の version と一致させる）
    - Release を Publish する
5. **Actions → Release** を確認する。npm publish が自動で走る
