# GitHub Actions Runners

Soft Recall Demo uses GitHub-hosted runners for CI and deployment workflows.

## Recommended Runner

- Runner: `ubuntu-latest`
- Node.js: `24`

This keeps checks close to the GitHub Pages deployment environment and avoids maintaining local runner infrastructure.

## Self-Hosted Runners

Self-hosted runners are not recommended right now. The project is a static Vite React app, and GitHub-hosted runners are enough for build and deployment checks.

## Secrets and Tokens

Runner tokens, deployment credentials, API keys, and other secrets must never be committed to the repository.

Use GitHub repository secrets or environment secrets when a workflow needs sensitive values. This project should not require custom secrets for normal static build checks.
