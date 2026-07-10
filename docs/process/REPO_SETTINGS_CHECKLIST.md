# Repository Settings Checklist

Use this checklist when preparing or reviewing the GitHub repository settings for Soft Recall Demo.

## General

- Repository name: `soft-recall-demo`.
- Default branch: `main`.
- Visibility: use the intended public/private setting for the project stage.
- Description: mention static Vite React, first-person narrative demo, and PC browser focus.
- Website URL: point to the GitHub Pages live demo when Pages is enabled.

## Pages

- Source: GitHub Actions.
- Deployment workflow: `.github/workflows/deploy.yml`.
- Vite base path: `/soft-recall-demo/`.
- Production build output: `dist/`.

## Branch Protection

Recommended for `main`:

- Require pull request before merging.
- Require CI workflow to pass.
- Require up-to-date branch before merge when practical.
- Do not require self-hosted runners.
- Allow administrators to bypass only when necessary for repository recovery.

## Actions

- Use GitHub-hosted runners.
- Recommended runner: `ubuntu-latest`.
- Recommended Node version: `24`.
- Do not commit runner tokens, Pages tokens, API keys, or deployment secrets.
- Keep CI lightweight: install, build, and confirm `dist/index.html`.

## Issues And PRs

- Enable Issues.
- Use the issue templates in `.github/ISSUE_TEMPLATE/`.
- Use `.github/pull_request_template.md` for PRs.
- Require manual PC playthrough QA for gameplay-facing changes.

## Project Guardrails

- No backend, auth, database, server runtime, dashboards, audio, voiceover, music, or sound effects.
- No mobile/PWA/native wrapper work until it is explicitly scheduled.
- No direct clinical diagnosis, treatment, screening, or medical advice framing.
- Build passing is necessary but not sufficient for gameplay changes.
