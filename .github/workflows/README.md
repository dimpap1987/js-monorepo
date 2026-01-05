# GitHub Actions Workflows

This directory contains the CI/CD workflows for the monorepo. The workflows are designed following senior developer best practices with proper separation of concerns, caching, parallelization, and error handling.

## Workflow Files

### 1. `ci.yml` - Continuous Integration
**Triggers:** Push to main/develop/integration, Pull Requests, Manual dispatch

**Jobs:**
- **setup**: Determines affected projects using Nx
- **lint**: Runs ESLint on affected projects (parallel execution)
- **format-check**: Validates code formatting with Prettier
- **test**: Runs tests with coverage (sharded for parallel execution)
- **type-check**: Validates TypeScript types
- **build**: Builds all affected applications
- **security**: Runs npm audit and Trivy vulnerability scanning
- **ci-summary**: Creates a summary of all CI jobs

**Key Features:**
- ✅ Nx affected commands for efficient execution
- ✅ Parallel job execution where possible
- ✅ Comprehensive caching (npm, Nx)
- ✅ Code coverage reporting with Codecov
- ✅ Security scanning
- ✅ Artifact uploads for debugging
- ✅ Fail-fast strategy for faster feedback

### 2. `cd.yml` - Continuous Deployment
**Triggers:** Push to main/develop, Manual dispatch

**Jobs:**
- **determine-changes**: Detects which apps/libs changed
- **run-migrations**: Runs database migrations if schema changed
- **build-and-push**: Builds and pushes Docker images (multi-platform)
- **deployment-summary**: Creates deployment summary

**Key Features:**
- ✅ Smart change detection (only builds what changed)
- ✅ Automatic migration deployment
- ✅ Multi-platform Docker builds (amd64, arm64)
- ✅ Docker layer caching for faster builds
- ✅ Environment-based deployments (staging/production)
- ✅ Version tagging (semver, branch, sha)

### 3. `pr-checks.yml` - Pull Request Validation
**Triggers:** PR opened/updated/reopened/ready for review

**Jobs:**
- **pr-validation**: Validates PR title format, checks for large files/secrets
- **quality-gate**: Runs lint, format, test, type-check
- **build-verification**: Verifies affected apps can build
- **pr-comment**: Posts summary comment on PR

**Key Features:**
- ✅ Conventional commits validation
- ✅ Large file detection
- ✅ Secret scanning
- ✅ PR comment with check results
- ✅ Quality gates before merge

## Improvements Over Previous Workflow

### 1. **Separation of Concerns**
- Separate CI and CD workflows
- Dedicated PR validation workflow
- Clear job dependencies

### 2. **Performance Optimizations**
- Nx affected commands (only run what changed)
- Parallel job execution
- Comprehensive caching (npm, Nx, Docker)
- Test sharding for faster execution
- Docker build cache

### 3. **Better Error Handling**
- Fail-fast strategy where appropriate
- Artifact uploads for debugging
- Detailed job summaries
- Status reporting

### 4. **Security Enhancements**
- npm audit scanning
- Trivy vulnerability scanning
- Secret detection in PRs
- SARIF upload for GitHub Security

### 5. **Code Quality**
- Format checking
- Type checking
- Coverage reporting
- PR title validation

### 6. **Deployment Strategy**
- Smart change detection
- Environment-based deployments
- Multi-platform Docker builds
- Version tagging strategy

### 7. **Developer Experience**
- PR comments with check results
- Clear job names and summaries
- Artifact retention for debugging
- Manual workflow dispatch

## Usage

### Running CI Manually
```bash
# Trigger CI workflow manually
gh workflow run ci.yml
```

### Running CD Manually
```bash
# Deploy to staging
gh workflow run cd.yml -f environment=staging

# Deploy to production
gh workflow run cd.yml -f environment=production
```

### Viewing Workflow Status
```bash
# List recent workflow runs
gh run list

# View specific workflow run
gh run view <run-id>
```

## Required Secrets

### CI/CD Secrets (All existing - no new secrets needed!)
- `DATABASE_URL_PROD` - Production database URL ✅ (already exists)
- `DIRECT_URL_PROD` - Production direct database URL ✅ (already exists)
- `TEST_DATABASE_URL` - Test/staging database URL ✅ (already exists in migrations workflow)
- `TEST_DIRECT_URL` - Test/staging direct database URL ✅ (already exists in migrations workflow)
- `DOCKERHUB_TOKEN` - Docker Hub authentication token ✅ (already exists)
- `DOCKERHUB_USERNAME` - Docker Hub username ✅ (already exists, defaults to "dimpap" if not set)

### Optional Secrets
- `CODECOV_TOKEN` - Codecov token for coverage reporting (optional - coverage will work without it, just won't upload to Codecov)

### Application Secrets
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD` - Stripe publishable key
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY_PROD` - VAPID public key

## Environment Strategy

- **main branch** → Production environment
- **develop branch** → Staging environment
- **integration branch** → Integration environment

## Caching Strategy

1. **npm cache**: Cached by package-lock.json hash
2. **Nx cache**: Cached by nx.json and source files
3. **Docker cache**: Registry-based layer caching

## Best Practices

1. **Always use Nx affected commands** - Only run what changed
2. **Parallel execution** - Run independent jobs in parallel
3. **Cache everything** - npm, Nx, Docker layers
4. **Fail fast** - Stop early if critical checks fail
5. **Artifact retention** - Keep artifacts for debugging
6. **Security first** - Scan for vulnerabilities
7. **Clear reporting** - Summaries and PR comments

## Troubleshooting

### Workflow fails on "affected" check
- Ensure `fetch-depth: 0` is set in checkout
- Verify base branch exists and is accessible

### Docker build fails
- Check build args are correctly set
- Verify secrets are available in environment
- Check Dockerfile context paths

### Tests fail in CI but pass locally
- Check Node.js version matches
- Verify environment variables
- Check for race conditions in parallel tests

### Cache not working
- Verify cache keys are correct
- Check cache size limits
- Ensure cache paths are correct

