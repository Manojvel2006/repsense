# Release Checklist

## Pre-Release

- [ ] Version bump in `package.json` and `app.json`
- [ ] Update CHANGELOG.md
- [ ] Run full test suite: `npm test`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run lint: `npm run lint`
- [ ] Build Android release: `npm run build:android`
- [ ] Build iOS release: `npm run build:ios`
- [ ] Run E2E tests: `npm run test:e2e`

## Android Release

- [ ] Generate signed AAB
- [ ] Test on physical device
- [ ] Verify ProGuard rules
- [ ] Check 64-bit architectures (arm64-v8a, x86_64)
- [ ] Verify Play Store listing assets
- [ ] Upload to Play Console (Internal → Closed → Open)
- [ ] Rollout percentage: 10% → 50% → 100%

## iOS Release

- [ ] Generate signed IPA
- [ ] Test on physical device (TestFlight)
- [ ] Verify Info.plist permissions
- [ ] Check App Store Connect listing
- [ ] Submit for Review
- [ ] Monitor review status

## Post-Release

- [ ] Monitor crash reports (Sentry/Firebase)
- [ ] Monitor analytics
- [ ] Check user feedback
- [ ] Prepare hotfix branch if needed
- [ ] Update documentation

## Versioning

- Major: Breaking API changes, major UI overhaul
- Minor: New features, backwards compatible
- Patch: Bug fixes, minor improvements

Format: MAJOR.MINOR.PATCH (e.g., 1.2.3)