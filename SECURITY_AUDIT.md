# Security baseline — 2026-11-19

## Confirmed findings and remediation
- `deploy.sh` recursively ran itself; replaced with a non-deploying safety notice.
- `masterbot.js` previously accepted unauthenticated requests to a billable AI API. The endpoint now requires `Authorization: Bearer <MASTERBOT_ACCESS_TOKEN>` and refuses requests if credentials are absent.
- Added request length, per-IP and global in-process rate limits, and a bounded AI response. **These are single-instance safeguards, not distributed quotas.** For production with multiple instances, use a shared rate limiter, server-side billing quotas and provider budget limits.
- Reduced upstream timeouts, masked upstream error details, and disabled Express identification headers.
- Tightened ignore patterns for common local secrets; **gitignore does not remove files already in Git history**.
- Added Dependabot weekly PR checks, without automatic merging.

## Deployment prerequisites
1. Set `OPENAI_API_KEY` (or the legacy `GPT_API_KEY`) and a randomly generated `MASTERBOT_ACCESS_TOKEN` in your secure backend environment, not in frontend code.
2. Existing clients must be updated to send a Bearer token from a trusted backend. **Do not put this shared token in browser JavaScript.** Use authenticated user sessions and a server-side proxy for a public consumer app.
3. Add a shared rate limiter and provider-side spending limits for scalable deployments.
4. Verify install/build/tests with an appropriate lockfile; none was present in this inspected repository.
5. Check historic commits for credentials; revoke any actually exposed tokens.
6. Review branch protection, GitHub secret scanning, actions permissions and billing settings in the GitHub and provider dashboards.
7. Migrate legacy `autoblog.py` OpenAI API usage before scheduling publishing; human-review generated factual and affiliate claims.

## Not verified
No production deployment, payment processing, live secrets, dependency vulnerability scan, end-to-end runtime test or domain uptime check has been completed. This pull request is intentionally review-only.
