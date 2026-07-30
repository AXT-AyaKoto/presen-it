# 公開チェックリスト（メンテナ向け）

## 初回セットアップ: npm Trusted Publishing

1. npm の [`@axt_ayakoto/presenit`](https://www.npmjs.com/package/@axt_ayakoto/presenit) → **Settings → Trusted Publisher**
2. GitHub Actions を追加:
    - Organization or user: `AXT-AyaKoto`
    - Repository: `presen-it`
    - Workflow filename: `release.yml`
    - Environment: （未使用なら空）
3. このリポジトリの Release workflow は `id-token: write` + `pnpm publish --provenance` で OIDC 認証する（`NPM_TOKEN` は不要）

フォールバックとして Automation トークンを `NPM_TOKEN` に置くやり方もあるが、2FA 付きアカウントでは OTP エラーになりやすい。Trusted Publishing を優先する。

## 毎回のリリース手順

1. `package.json` と `src/pkg.ts` のバージョンを上げる
2. `CHANGELOG.md` を更新する
3. `main` にマージする
4. GitHub → **Releases → Draft a new release**
    - Tag: `vX.Y.Z`（`package.json` の version と一致させる）
    - Release を Publish する
5. **Actions → Release** を確認する。npm publish が自動で走る

1.0.0 以降は、明示的なリリース依頼があるまでエージェントが勝手にタグ／Release を切らない（`.cursor/rules/release-policy.mdc`）。

公式サイトは `site/` を **Actions → GitHub Pages** workflow がデプロイする（https://axt-ayakoto.github.io/presen-it/）。
