# Scripts Directory - Automation Framework

This directory contains a comprehensive automation framework for the BeProductive v2 application. These scripts form a sophisticated build, deployment, and quality assurance pipeline.

## 🎯 Overview

The scripts framework implements multiple automation patterns:
- **5S Lean Methodology** for codebase organization
- **Production Readiness** validation
- **AI-powered** code quality analysis
- **Performance** monitoring and optimization
- **Security** scanning and validation
- **Asset optimization** and CDN management

## 📂 Script Categories

### 🏭 Core Quality & Organization

#### `5s-agent.js` - Lean 5S Codebase Organization
**Purpose**: Applies 5S workplace methodology to maintain codebase quality
**Usage**:
```bash
npm run 5s:analyze           # Analyze current state
npm run 5s:sort             # Phase 1: Remove unnecessary files
npm run 5s:organize         # Phase 2: Organize file structure
npm run 5s:clean            # Phase 3: Clean code and formatting
npm run 5s:standardize      # Phase 4: Apply coding standards
npm run 5s:sustain          # Phase 5: Setup maintenance routines
npm run 5s:report           # Generate comprehensive report
```
**Inputs**: Source code, configuration files
**Outputs**: Cleanup reports, organized file structure, metrics

#### `code-quality-analyzer.js` - Code Quality Metrics
**Purpose**: Analyzes code quality, complexity, and maintainability
**Usage**: `npm run quality:analyze`
**Inputs**: Source files, test coverage reports
**Outputs**: Quality metrics, recommendations, quality gates status

### 🚀 Production & Deployment

#### `production-readiness-orchestrator.js` - Production Validation
**Purpose**: Orchestrates comprehensive production readiness testing
**Usage**:
```bash
npm run test:production-readiness              # Full validation
npm run test:production-readiness:parallel     # Parallel execution
npm run test:production-readiness:fail-fast    # Stop on first failure
```
**Environment Variables**:
- `PARALLEL_TESTS=true/false` - Enable parallel test execution
- `FAIL_FAST=true/false` - Stop on first failure
- `VERBOSE=true/false` - Detailed logging

**Test Categories**:
1. **Security**: Vulnerability scans, dependency checks
2. **Performance**: Load testing, Web Vitals, bundle analysis
3. **Reliability**: Error handling, failover testing
4. **Compliance**: Accessibility, GDPR, security standards
5. **UX/Usability**: User experience validation
6. **DevOps**: CI/CD pipeline validation
7. **Data Management**: Database integrity, backup validation
8. **Integration**: API testing, third-party service validation

#### `production-readiness-report.js` - Deployment Reports
**Purpose**: Generates comprehensive production readiness reports
**Usage**: `npm run production:report`
**Outputs**: Detailed readiness assessment, deployment approval/rejection

### 🔧 Build & Optimization

#### `build-optimizer.js` - Build Process Optimization
**Purpose**: Optimizes build process, bundle analysis, performance tuning
**Usage**: Integrated with build process
**Features**:
- Dynamic import optimization
- Bundle size analysis
- Dead code elimination
- Performance profiling

#### `bundle-analyzer.js` - Bundle Analysis
**Purpose**: Analyzes bundle composition and identifies optimization opportunities
**Usage**: `npm run bundle:analyze`
**Outputs**: Bundle composition reports, size recommendations

#### `advanced-bundle-analyzer.js` - Advanced Bundle Metrics
**Purpose**: Deep bundle analysis with dependency graphs and optimization recommendations
**Features**:
- Dependency tree analysis
- Duplicate detection
- Load performance simulation
- Optimization recommendations

#### `optimize-assets.js` - Asset Optimization
**Purpose**: Optimizes images, fonts, and static assets for production
**Usage**:
```bash
npm run assets:optimize      # Optimize all assets
npm run cdn:config          # Generate CDN configuration
```
**Features**:
- Image compression and format conversion
- Font subsetting and optimization
- CDN configuration generation
- Asset versioning and cache busting

### 🤖 AI & Automation

#### `ai-system-validator.js` - AI System Health Check
**Purpose**: Validates AI integrations, API connectivity, and service health
**Usage**:
```bash
npm run ai:validate         # Check AI system health
npm run ai:health          # Detailed health diagnostics
```
**Checks**:
- API key validation
- Service connectivity
- Rate limiting status
- Model availability
- Response quality validation

#### `ai-interface-agent.cjs` - AI Interface Management
**Purpose**: Manages AI model interfaces, prompt optimization, and response validation
**Features**:
- Multi-provider support (OpenAI, Anthropic, Google)
- Prompt template management
- Response quality assessment
- Cost optimization

### 🌐 Internationalization & Content

#### `i18n-agent.cjs` - Internationalization Management
**Purpose**: Manages translations, locale validation, and content localization
**Usage**: Integrated with build process
**Features**:
- Translation file validation
- Missing translation detection
- Locale-specific asset optimization
- RTL language support validation

#### `demo-data-generator.cjs` - Demo Data Management
**Purpose**: Generates realistic demo data for development and testing
**Features**:
- User personas generation
- Realistic task and goal data
- Multi-language demo content
- Privacy-compliant test data

### 🔒 Security & Backup

#### `backup-recovery.js` - Backup & Recovery Management
**Purpose**: Manages database backups, disaster recovery testing
**Usage**:
```bash
npm run backup:setup       # Setup backup systems
npm run backup:database    # Create database backup
npm run backup:test        # Test recovery procedures
```
**Features**:
- Automated backup scheduling
- Recovery validation
- Disaster recovery testing
- Backup integrity verification

### 📱 Development Tools

#### `open-mobile-window.js` - Mobile Development Assistant
**Purpose**: Opens browser windows with mobile device dimensions for testing
**Usage**:
```bash
npm run dev:mobile         # Default mobile (390×844)
npm run dev:iphone         # iPhone 14 Pro (393×852)
npm run dev:android        # Google Pixel 7 (412×915)
```
**Features**:
- Multiple device presets
- Floating window positioning
- Development server integration
- Cross-platform compatibility

#### `performance-gate.js` - Performance Gating
**Purpose**: Enforces performance budgets and quality gates
**Usage**: Integrated with CI/CD pipeline
**Metrics**:
- Bundle size limits
- Core Web Vitals thresholds
- Loading performance budgets
- Memory usage limits

### 🧹 Maintenance & Cleanup

#### `codebase-cleanup-agent.cjs` - Codebase Maintenance
**Purpose**: Automated codebase maintenance and cleanup
**Features**:
- Dead code elimination
- Dependency cleanup
- Code formatting standardization
- Import optimization

#### `ux-navigation-agent.cjs` - UX Research & Navigation
**Purpose**: Analyzes navigation patterns and UX metrics
**Features**:
- Navigation flow analysis
- User journey mapping
- Accessibility validation
- Mobile UX optimization

## 🔧 Configuration

### Environment Variables
```bash
# Testing Configuration
PARALLEL_TESTS=true          # Enable parallel test execution
FAIL_FAST=false             # Continue on test failures
VERBOSE=true                # Detailed logging

# Quality Gates
QUALITY_THRESHOLD=80        # Minimum quality score
COVERAGE_THRESHOLD=80       # Minimum test coverage
BUNDLE_SIZE_LIMIT=500       # Maximum bundle size (KB)

# AI Configuration
OPENAI_API_KEY=your_key     # OpenAI integration
ANTHROPIC_API_KEY=your_key  # Claude integration
```

### Script Configuration Files
- `scripts/config/` - Configuration files for individual scripts
- `.env` files - Environment-specific settings
- `package.json` scripts - Entry points and aliases

## 🚦 Quality Gates

The scripts implement comprehensive quality gates:

1. **Code Quality**: ESLint, TypeScript, complexity analysis
2. **Test Coverage**: Unit, integration, E2E test coverage
3. **Performance**: Bundle size, Web Vitals, loading metrics
4. **Security**: Vulnerability scans, dependency audits
5. **Accessibility**: WCAG compliance, screen reader testing
6. **Production Readiness**: Comprehensive deployment validation

## 📊 Monitoring & Reporting

### Output Formats
- **JSON**: Machine-readable reports for CI/CD integration
- **Markdown**: Human-readable reports for documentation
- **HTML**: Interactive reports with charts and graphs
- **Console**: Real-time feedback during execution

### Report Locations
- `5s-reports/` - 5S organization reports
- `production-readiness-report/` - Production validation reports
- `test-results/` - Test execution results
- `coverage/` - Test coverage reports

## 🔄 Integration with CI/CD

The scripts integrate seamlessly with the CI/CD pipeline:

```yaml
# Example CI integration
- name: Run Quality Gates
  run: npm run gates:check

- name: Production Readiness
  run: npm run production:ready

- name: 5S Organization Check
  run: npm run 5s:check
```

## 🛠 Maintenance

### Adding New Scripts
1. Create script in appropriate category subdirectory
2. Add npm script alias in `package.json`
3. Update this README with script documentation
4. Add integration tests for script functionality

### Script Dependencies
- **Node.js 18+**: Modern JavaScript features
- **npm packages**: See individual script imports
- **External tools**: Docker, browsers for E2E testing

### Troubleshooting
- Check Node.js version compatibility
- Verify environment variables are set
- Review script logs in output directories
- Consult individual script help with `--help` flag

---

**Note**: This framework represents a production-grade automation system. Each script is designed for reliability, maintainability, and integration with the broader development workflow.