# Azure Communication Services Dependency Management Guide

> **Note:** Version numbers shown in this document are for demonstration purposes only and may not reflect the latest available versions. Always check npm for the most current version information.

## Quick Update

### Update to Latest Communication-React Stable

**Estimated Time:** ~5-7 minutes total

```bash
# Navigate to Calling directory and check available versions first
cd Calling
npm view @azure/communication-react versions --json | tail -5

# Update to latest stable version
npm install @azure/communication-react@latest

# Update dependencies to versions required by communication-react
npm install @azure/communication-calling@^1.36.1
npm install @azure/communication-chat@^1.5.4
npm install @azure/communication-calling-effects@^1.1.4
npm install @azure/communication-common@^2.3.1

# Return to root and rebuild everything
cd ..
npm run build                   # ~4-5 minutes
```

## Complete Dependency Synchronization

### Update All Azure Communication Services Dependencies

**Estimated Time:** ~10-12 minutes total

```bash
# First, check available versions
npm view @azure/communication-react versions --json | tail -5

# Update Calling dependencies with latest stable versions
cd Calling
npm install @azure/communication-react@latest
npm install @azure/communication-calling@^1.36.1
npm install @azure/communication-chat@^1.5.4
npm install @azure/communication-calling-effects@^1.1.4
npm install @azure/communication-common@^2.3.1
npm update @azure/core-http
npm update @azure/core-paging

# Update Server dependencies
cd ../Server
npm install @azure/communication-chat@latest
npm install @azure/communication-identity@latest
npm install @azure/communication-common@^2.3.1
npm install @azure/communication-rooms@latest

# Return to root and perform full build
cd ..
npm run build                   # ~8-10 minutes
```

**Expected Calling Dependencies After Update:**

- `@azure/communication-react`: Latest stable (e.g., `1.29.0`)
- `@azure/communication-calling`: Compatible with react (e.g., `1.36.1+`)
- `@azure/communication-chat`: Compatible with react (e.g., `1.5.4+`)
- `@azure/communication-common`: Required by react (e.g., `2.3.1+`)
- `@azure/communication-calling-effects`: Required by react (e.g., `1.1.4`)

**Expected Server Dependencies After Update:**

- `@azure/communication-chat`: Latest stable (e.g., `1.6.0`)
- `@azure/communication-common`: Matching Calling directory (e.g., `2.3.1+`)
- `@azure/communication-identity`: Latest stable (e.g., `1.3.1`)
- `@azure/communication-rooms`: Latest stable (e.g., `1.2.0`)

## Verification

### Version Check

```bash
# Check Calling dependencies
cd Calling
npm list --depth=0 | grep "@azure/communication"

# Check Server dependencies
cd ../Server
npm list --depth=0 | grep "@azure/communication"

# Alternative: Check package.json files directly
cat Calling/package.json | grep "@azure/communication"
cat Server/package.json | grep "@azure/communication"
```

### Expected Version Indicators

- **Stable**: Version without pre-release suffix (e.g., `2.4.0`)
- **Beta**: Version includes `-beta` suffix (e.g., `1.39.0-beta.1`) - avoid in production
- **Alpha**: Version includes `-alpha` suffix (e.g., `1.31.0-alpha-202508010020`) - avoid in production

### Configuration Files

- **Calling Dependencies**: [`Calling/package.json`](Calling/package.json)
- **Server Dependencies**: [`Server/package.json`](Server/package.json)
- **Calling Lock File**: [`Calling/package-lock.json`](Calling/package-lock.json)
- **Server Lock File**: [`Server/package-lock.json`](Server/package-lock.json)

### Build Success Indicators

- Calling builds successfully without critical errors
- Server builds successfully without critical errors
- Minor TypeScript warnings are acceptable and non-blocking
- No dependency resolution conflicts

## Dependency Compatibility Matrix

### Important: Communication-React Drives Other Versions

**Key Principle:** `@azure/communication-react` has specific peer dependency requirements that must be followed. Do not update other Azure Communication packages to their latest versions unless they are compatible with the communication-react version you're using.

### Communication-React Stable Alignment

When updating [`@azure/communication-react`](https://www.npmjs.com/package/@azure/communication-react) to stable versions, ensure compatible versions:

| Communication-React Stable | Required Calling   | Required Chat   | Required Common   |
| -------------------------- | ------------------ | --------------- | ----------------- |
| `1.29.0`                   | `^1.36.1`          | `>=1.5.4`       | `^2.3.1`          |
| `1.28.0`                   | `^1.35.1`          | `>=1.5.4`       | `^2.3.1`          |
| `1.27.0`                   | `^1.35.1`          | `>=1.5.4`       | `^2.3.1`          |

### Cross-Directory Compatibility

Ensure [`@azure/communication-common`](https://www.npmjs.com/package/@azure/communication-common) versions are compatible between Calling and Server:

```bash
# Check for version conflicts
npm list @azure/communication-common --depth=0
```

**Resolution Strategy:**

1. **Always follow communication-react requirements first** - Check peer dependencies with `npm view @azure/communication-react@<version> peerDependencies`
2. Use the version of [`@azure/communication-common`](https://www.npmjs.com/package/@azure/communication-common) required by communication-react in both directories
3. Only update other packages if they meet communication-react's peer dependency requirements

### Checking Communication-React Requirements

Before updating any dependencies, always check what the current stable communication-react version requires:

```bash
# Check peer dependencies for the latest stable version
npm view @azure/communication-react@latest peerDependencies

# Check regular dependencies
npm view @azure/communication-react@latest dependencies | grep "@azure/communication"
```

## Performance Optimization & Issue Prevention

### Common Issues and Solutions

#### npm Command Hanging

**Symptoms:** `npm install @azure/communication-react@latest` or similar commands hang indefinitely

**Solutions:**

1. **Use Specific Versions Instead of Generic Tags:**

   ```bash
   # Instead of generic tags that can hang:
   # npm install @azure/communication-react@latest

   # Use specific versions:
   npm view @azure/communication-react versions --json | tail -5
   npm install @azure/communication-react@1.29.0
   npm install @azure/communication-calling@^1.36.1
   npm install @azure/communication-calling-effects@^1.1.4
   ```

2. **Set npm Timeout:**

   ```bash
   # Set network timeout (60 seconds)
   npm config set timeout 60000

   # Alternative: use yarn for problematic packages
   yarn add @azure/communication-react@latest
   ```

3. **Clear Cache:**

   ```bash
   # Clear npm cache if installation issues persist
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Process Management:**

   ```bash
   # If npm hangs, kill the process:
   pkill -f "npm install"

   # Then try specific version or yarn alternative
   ```

### Faster Update Strategy

**Check Before Update:**

```bash
# Check current versions first
cd Calling && npm list --depth=0 | grep "@azure/communication"
cd ../Server && npm list --depth=0 | grep "@azure/communication"
```

**Use Parallel Updates Where Safe:**

```bash
# Update multiple packages at once with required versions
cd Calling
npm install @azure/communication-calling@^1.36.1 @azure/communication-chat@^1.5.4 @azure/communication-calling-effects@^1.1.4
```

**Network Optimization:**

```bash
# Use faster registry if needed
npm config set registry https://registry.npmjs.org/
```

## Build Error Handling

**Important:** If any build step fails, **STOP immediately** and do not proceed.

### Common Error Resolution

#### Version Conflict Errors

```bash
# Clear node_modules and reinstall
cd Calling && rm -rf node_modules package-lock.json && npm install
cd ../Server && rm -rf node_modules package-lock.json && npm install
cd .. && npm run build
```

#### TypeScript Compilation Errors

```bash
# Check for breaking changes in stable versions
cd Calling
npm list @azure/communication-react
# Review release notes for breaking changes
```

#### Dependency Resolution Issues

```bash
# Use npm overrides in package.json if needed
cd Calling
# Add to package.json:
# "overrides": {
#   "@azure/communication-common": "^2.4.0"
# }
npm install
```

**Protocol:**

1. **Stop on First Error:** Do not continue if build fails
2. **Capture Error Details:** Note specific package(s) and error messages
3. **Check Compatibility:** Verify stable version compatibility
4. **Summarize the Problem:** Include:
   - Which directory failed (Calling/ or Server/)
   - Which package(s) had build errors
   - Key error messages
   - Suggested next steps

**Example Error Summary:**

```
Build failed during Calling dependency update to communication-react stable.

Failed directory: Calling/
Failed packages:
- @azure/communication-react: TypeScript compilation errors
- Type conflicts with @azure/communication-calling

Key errors:
- TS2304: Cannot find name 'CallClientState'
- Version conflict between @azure/communication-react@1.29.0 and @azure/communication-calling@1.35.1

Recommended action: Check stable compatibility matrix and update calling to compatible stable version.
```

## Automated Dependency Management

### Update Scripts

Add these scripts to root [`package.json`](package.json) for easier dependency management:

```json
{
  "scripts": {
    "update:acs:stable": "npm view @azure/communication-react versions --json | tail -5 && echo 'Use specific version from above' && cd Calling && npm install @azure/communication-calling@^1.36.1 @azure/communication-chat@^1.5.4 @azure/communication-calling-effects@^1.1.4 @azure/communication-common@^2.3.1 && cd ../Server && npm install @azure/communication-common@^2.3.1 && cd .. && npm run build",
    "update:acs:full": "cd Calling && npm update @azure/communication-* && cd ../Server && npm update @azure/communication-* && cd .. && npm run build",
    "check:versions": "cd Calling && npm list --depth=0 | grep '@azure/communication' && cd ../Server && npm list --depth=0 | grep '@azure/communication'",
    "check:available": "npm view @azure/communication-react versions --json | tail -10",
    "clean:install": "cd Calling && rm -rf node_modules package-lock.json && npm install && cd ../Server && rm -rf node_modules package-lock.json && npm install",
    "config:timeout": "npm config set timeout 60000",
    "audit:security": "cd Calling && npm audit && cd ../Server && npm audit"
  }
}
```

### Usage Examples

```bash
# Check available stable versions first
npm run check:available

# Configure npm timeout to prevent hanging
npm run config:timeout

# Quick stable update (requires manual version specification)
npm run update:acs:stable

# Full dependency update
npm run update:acs:full

# Check current versions
npm run check:versions

# Clean reinstall (when conflicts occur)
npm run clean:install

# Security audit
npm run audit:security
```

## PR Documentation Guidelines

### Major Changes Documentation

**Dependency Updates:**

- List each dependency version change (from → to)
- Separate Calling/ and Server/ changes clearly
- Note any version regressions or notable changes
- Highlight stable version updates

**Example:**

```markdown
## Dependency Updates

### Calling Dependencies

- @azure/communication-react: 1.28.0 → 1.29.0
- @azure/communication-calling: 1.35.1 → 1.36.1+ (required by react)
- @azure/communication-chat: 1.5.4+ (compatible with react)

### Server Dependencies

- @azure/communication-common: 2.3.1+ (matching Calling directory)
- @azure/communication-identity: 1.3.0 → 1.3.1
```

**Build Verification:**

- Confirm successful build completion for both directories
- Note any warnings or minor issues
- Mention build time and any performance impacts

**Impact Assessment:**

- **Stable Updates**: Production-ready stability, maintains backward compatibility
- **Cross-Directory**: Verify no version conflicts between Calling/ and Server/
- **Security**: Address any security vulnerabilities resolved

## Example Prompts

### Stable Update

```
Update @azure/communication-react to the latest stable version and align all other Azure Communication Services dependencies accordingly. Use the dependency-management-guide.md for the process.
```

### Complete Sync

```
Perform a complete synchronization of all Azure Communication Services dependencies across both Calling/ and Server/ directories. Follow the dependency-management-guide.md workflow.
```

### Version Check

```
Check and report the current versions of all Azure Communication Services dependencies in both Calling/ and Server/ directories. Use the dependency-management-guide.md verification steps.
```

### Troubleshoot Build

```
The build is failing after a dependency update. Use the error handling section in dependency-management-guide.md to diagnose and resolve the issues.
```

These prompts guide the assistant to follow the proper workflow, update both directories appropriately, and verify installations according to the npm-based process.

## Monitoring and Maintenance

### Regular Update Schedule

**Weekly (Recommended):**

- Check for new [`@azure/communication-react`](https://www.npmjs.com/package/@azure/communication-react) stable releases
- Update to latest stable if available and compatible

**Bi-weekly:**

- Full dependency sync across both directories
- Verify no security vulnerabilities: `npm audit`

**Monthly:**

- Review and update stable dependencies in Server/
- Check for deprecated packages or breaking changes
- Review and update peer dependencies

### Health Checks

```bash
# Verify no dependency conflicts
npm install --dry-run

# Security audit
cd Calling && npm audit --audit-level moderate
cd ../Server && npm audit --audit-level moderate

# Outdated package check
cd Calling && npm outdated
cd ../Server && npm outdated

# License compliance check
cd Calling && npx license-checker --summary
cd ../Server && npx license-checker --summary
```

### Automation Opportunities

Consider implementing:

- **GitHub Actions**: Automated dependency update PRs
- **Dependabot**: Automated security updates
- **Pre-commit hooks**: Version compatibility checks
- **CI checks**: Build verification across dependency changes
- **Scheduled updates**: Weekly stable version checks

### Best Practices

1. **Always use stable versions in production**
2. **Test dependency updates in development environment first**
3. **Keep [`@azure/communication-common`](https://www.npmjs.com/package/@azure/communication-common) versions synchronized across directories**
4. **Document any custom dependency resolutions or overrides**
5. **Monitor Azure Communication Services release notes for breaking changes**
6. **Maintain compatibility with React and TypeScript versions**

### Emergency Rollback

If a dependency update causes critical issues:

```bash
# Rollback to previous working versions
cd Calling
git checkout HEAD~1 -- package.json package-lock.json
npm install

cd ../Server
git checkout HEAD~1 -- package.json package-lock.json
npm install

cd ..
npm run build
```

Always test the rollback in a development environment before applying to production.
