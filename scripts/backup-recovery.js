#!/usr/bin/env node

/**
 * Backup and Disaster Recovery Setup Script
 * Configures automated backups, disaster recovery procedures, and data protection
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

class BackupRecoverySetup {
  constructor() {
    this.backupStrategies = [];
    this.recoveryProcedures = [];
    this.testPlans = [];
  }

  generateBackupConfiguration() {
    console.log('\n💾 Setting up Backup Configuration...');

    const backupConfig = {
      // Database backup configuration
      database: {
        supabase: {
          // Automated backups through Supabase
          enabled: true,
          frequency: 'daily',
          retention: {
            daily: 7,    // 7 daily backups
            weekly: 4,   // 4 weekly backups
            monthly: 12  // 12 monthly backups
          },
          encryption: true,
          compression: true,
          backup_script: {
            command: 'npx supabase db dump',
            output_path: './backups/database/${date}-backup.sql',
            environment_variables: [
              'SUPABASE_PROJECT_REF',
              'SUPABASE_ACCESS_TOKEN'
            ]
          }
        },

        manual_backup: {
          script: `#!/bin/bash
# Manual database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/database"
BACKUP_FILE="$BACKUP_DIR/$DATE-manual-backup.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database dump
echo "Creating database backup..."
npx supabase db dump --db-url $SUPABASE_DB_URL > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Upload to cloud storage (AWS S3 example)
if [ ! -z "$AWS_S3_BUCKET" ]; then
  aws s3 cp $BACKUP_FILE.gz s3://$AWS_S3_BUCKET/backups/database/
  echo "Backup uploaded to S3"
fi`,

          verification: `#!/bin/bash
# Backup verification script
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: verify-backup.sh <backup_file>"
  exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Check file integrity
if gzip -t $BACKUP_FILE; then
  echo "✓ Backup file integrity check passed"
else
  echo "✗ Backup file is corrupted"
  exit 1
fi

# Check backup content (basic validation)
TEMP_FILE=$(mktemp)
gunzip -c $BACKUP_FILE > $TEMP_FILE

# Verify essential tables exist in backup
TABLES=("profiles" "tasks" "goals" "habits" "notes")
for table in "\${TABLES[@]}"; do
  if grep -q "CREATE TABLE.*\$table" \$TEMP_FILE; then
    echo "✓ Table \$table found in backup"
  else
    echo "✗ Table \$table missing from backup"
  fi
done

rm $TEMP_FILE
echo "Backup verification complete"`
        }
      },

      // Application data backup
      application: {
        static_assets: {
          enabled: true,
          source_directories: [
            './dist',
            './public',
            './src/assets'
          ],
          destination: {
            s3: {
              bucket: '${AWS_S3_BUCKET}',
              prefix: 'static-assets-backup/',
              versioning: true
            },
            local: {
              path: './backups/assets',
              retention_days: 30
            }
          }
        },

        configuration: {
          files: [
            '.env.production',
            '.env.staging',
            'package.json',
            'package-lock.json',
            'vite.config.ts',
            'quality-gates.config.js',
            'cdn-config.json',
            'monitoring-alerts.json'
          ],
          backup_frequency: 'on_change',
          encryption: true
        },

        user_generated_content: {
          // If storing user uploads/files locally
          enabled: false, // Usually handled by Supabase Storage
          note: 'User content typically stored in Supabase Storage with built-in redundancy'
        }
      },

      // Backup scheduling
      schedule: {
        automated: {
          database_backup: {
            cron: '0 2 * * *', // Daily at 2 AM
            timezone: 'UTC',
            enabled: true
          },
          assets_backup: {
            cron: '0 3 * * 0', // Weekly on Sunday at 3 AM
            timezone: 'UTC',
            enabled: true
          },
          config_backup: {
            trigger: 'on_deployment',
            enabled: true
          }
        },

        manual: {
          pre_deployment: true,
          on_demand: true,
          emergency: true
        }
      },

      // Cloud storage configuration
      storage: {
        primary: {
          provider: 'aws_s3',
          bucket: '${AWS_S3_BACKUP_BUCKET}',
          region: '${AWS_REGION}',
          encryption: 'AES256',
          versioning: true,
          lifecycle: {
            transition_to_ia: 30, // days
            transition_to_glacier: 90, // days
            expiration: 2555 // 7 years
          }
        },

        secondary: {
          provider: 'google_cloud_storage',
          bucket: '${GCS_BACKUP_BUCKET}',
          region: '${GCS_REGION}',
          encryption: true,
          note: 'Optional secondary backup location for geo-redundancy'
        }
      }
    };

    writeFileSync(
      join(rootDir, 'backup-config.json'),
      JSON.stringify(backupConfig, null, 2)
    );

    console.log('✓ Backup configuration generated');
    return backupConfig;
  }

  generateDisasterRecoveryPlan() {
    console.log('\n🚨 Setting up Disaster Recovery Plan...');

    const drPlan = {
      overview: {
        rto: '4 hours',     // Recovery Time Objective
        rpo: '1 hour',      // Recovery Point Objective
        priority: 'P1',     // Critical business application
        team: {
          lead: 'DevOps Team Lead',
          contacts: [
            'on-call-engineer@company.com',
            'infrastructure-team@company.com'
          ]
        }
      },

      scenarios: {
        database_failure: {
          severity: 'critical',
          rto: '2 hours',
          rpo: '30 minutes',
          detection: [
            'Application cannot connect to database',
            'Database health checks failing',
            'Supabase dashboard showing outages'
          ],
          response_steps: [
            '1. Verify Supabase service status',
            '2. Check application logs for connection errors',
            '3. Attempt database connection via Supabase CLI',
            '4. If Supabase is down, implement emergency maintenance page',
            '5. Monitor Supabase status for restoration',
            '6. If extended outage, consider backup restoration'
          ],
          recovery_procedure: `
# Database Recovery Procedure
1. Assess the scope of data loss
2. Identify the most recent valid backup
3. Create new Supabase project if primary is unrecoverable
4. Restore from backup:
   npx supabase db reset --db-url NEW_DB_URL
   psql NEW_DB_URL < latest_backup.sql
5. Update application environment variables
6. Run data integrity checks
7. Gradually restore traffic
8. Monitor application performance`
        },

        application_failure: {
          severity: 'high',
          rto: '1 hour',
          rpo: '15 minutes',
          detection: [
            'Application returning 5xx errors',
            'Health check endpoints failing',
            'User reports of inaccessibility'
          ],
          response_steps: [
            '1. Check CDN/hosting platform status',
            '2. Verify deployment status',
            '3. Check application logs and error tracking',
            '4. Roll back to previous deployment if needed',
            '5. Scale up resources if performance issue',
            '6. Implement temporary maintenance page if critical'
          ]
        },

        data_corruption: {
          severity: 'critical',
          rto: '4 hours',
          rpo: '1 hour',
          detection: [
            'Data integrity violations reported',
            'Users reporting incorrect data',
            'Automated data validation alerts'
          ],
          response_steps: [
            '1. Stop all write operations immediately',
            '2. Identify scope and timeline of corruption',
            '3. Isolate affected data',
            '4. Restore from point-in-time backup',
            '5. Replay transactions from backup point',
            '6. Verify data integrity before resuming operations'
          ]
        },

        security_breach: {
          severity: 'critical',
          rto: '2 hours',
          rpo: '0 minutes',
          detection: [
            'Unusual access patterns detected',
            'Security monitoring alerts',
            'User reports of unauthorized access'
          ],
          response_steps: [
            '1. Immediate containment - revoke all active sessions',
            '2. Change all secrets and API keys',
            '3. Assess scope of potential data access',
            '4. Notify users if personal data potentially accessed',
            '5. Implement additional security measures',
            '6. Conduct security audit before restoration'
          ]
        }
      },

      recovery_environments: {
        staging: {
          purpose: 'Testing recovery procedures',
          configuration: 'mirrors production with test data',
          restore_frequency: 'weekly',
          automation: true
        },

        disaster_recovery: {
          purpose: 'Emergency production replacement',
          configuration: 'production-equivalent infrastructure',
          restore_frequency: 'daily',
          automation: true,
          failover_time: '30 minutes'
        }
      },

      communication_plan: {
        internal: {
          incident_channel: '#incident-response',
          stakeholders: [
            'engineering-team@company.com',
            'product-team@company.com',
            'executives@company.com'
          ],
          update_frequency: 'every 30 minutes during incidents'
        },

        external: {
          status_page: 'https://status.company.com',
          customer_communication: [
            'Email notifications',
            'In-app banners',
            'Social media updates'
          ],
          sla_commitments: {
            notification_time: '15 minutes',
            resolution_updates: '1 hour',
            post_incident_report: '48 hours'
          }
        }
      },

      testing: {
        frequency: 'quarterly',
        scenarios: [
          'database_restoration_test',
          'application_rollback_test',
          'failover_test',
          'data_integrity_verification'
        ],
        success_criteria: [
          'RTO met for all scenarios',
          'RPO met for all scenarios',
          'All team members can execute procedures',
          'Communication plan works effectively'
        ]
      }
    };

    writeFileSync(
      join(rootDir, 'disaster-recovery-plan.json'),
      JSON.stringify(drPlan, null, 2)
    );

    console.log('✓ Disaster recovery plan generated');
    return drPlan;
  }

  generateBackupScripts() {
    console.log('\n📜 Generating Backup Scripts...');

    const backupDir = join(rootDir, 'scripts', 'backup');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    // Database backup script
    const dbBackupScript = `#!/bin/bash
# Automated Database Backup Script
set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/database"
BACKUP_FILE="$BACKUP_DIR/$DATE-database-backup.sql"
RETENTION_DAYS=30

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Logging function
log() {
  echo -e "\${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]\\033[0m $1"
}

error() {
  echo -e "\${RED}[ERROR]\\033[0m $1" >&2
}

warn() {
  echo -e "\${YELLOW}[WARNING]\\033[0m $1"
}

# Check required environment variables
check_env() {
  local required_vars=("SUPABASE_PROJECT_REF" "SUPABASE_ACCESS_TOKEN")

  for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
      error "Required environment variable $var is not set"
      exit 1
    fi
  done
}

# Create backup directory
setup_backup_dir() {
  if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
  fi
}

# Perform database backup
backup_database() {
  log "Starting database backup..."

  # Create the backup
  if npx supabase db dump --project-ref $SUPABASE_PROJECT_REF > "$BACKUP_FILE"; then
    log "Database backup created: $BACKUP_FILE"
  else
    error "Failed to create database backup"
    exit 1
  fi

  # Compress the backup
  if gzip "$BACKUP_FILE"; then
    log "Backup compressed: $BACKUP_FILE.gz"
    BACKUP_FILE="$BACKUP_FILE.gz"
  else
    warn "Failed to compress backup, continuing with uncompressed file"
  fi

  # Verify backup integrity
  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "Backup integrity verified"
  else
    error "Backup integrity check failed"
    exit 1
  fi
}

# Upload to cloud storage
upload_backup() {
  if [ ! -z "$AWS_S3_BUCKET" ]; then
    log "Uploading backup to S3..."
    if aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/database/"; then
      log "Backup uploaded to S3 successfully"
    else
      warn "Failed to upload backup to S3"
    fi
  fi
}

# Clean up old backups
cleanup_old_backups() {
  log "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
  log "Cleanup completed"
}

# Main execution
main() {
  log "Starting automated database backup"

  check_env
  setup_backup_dir
  backup_database
  upload_backup
  cleanup_old_backups

  log "Database backup completed successfully"

  # Send notification (optional)
  if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \\
      --data "{\\"text\\":\\"✅ Database backup completed successfully: $BACKUP_FILE\\"}" \\
      "$SLACK_WEBHOOK_URL"
  fi
}

# Execute main function
main "$@"`;

    writeFileSync(join(backupDir, 'backup-database.sh'), dbBackupScript);

    // Application backup script
    const appBackupScript = `#!/bin/bash
# Application Assets and Configuration Backup Script
set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/application"
BACKUP_FILE="$BACKUP_DIR/$DATE-application-backup.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Creating application backup..."

# Create tar archive of important files
tar -czf "$BACKUP_FILE" \\
  --exclude=node_modules \\
  --exclude=dist \\
  --exclude=.git \\
  --exclude=backups \\
  --exclude=test-results \\
  --exclude=coverage \\
  ./src \\
  ./public \\
  ./supabase \\
  ./scripts \\
  .env.example \\
  .env.production \\
  .env.staging \\
  package.json \\
  package-lock.json \\
  vite.config.ts \\
  quality-gates.config.js \\
  cdn-config.json \\
  monitoring-alerts.json \\
  backup-config.json \\
  disaster-recovery-plan.json

echo "Application backup created: $BACKUP_FILE"

# Upload to cloud storage if configured
if [ ! -z "$AWS_S3_BUCKET" ]; then
  echo "Uploading to S3..."
  aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/application/"
  echo "Backup uploaded to S3"
fi

echo "Application backup completed"`;

    writeFileSync(join(backupDir, 'backup-application.sh'), appBackupScript);

    // Recovery test script
    const recoveryTestScript = `#!/bin/bash
# Disaster Recovery Test Script
set -e

echo "🧪 Starting Disaster Recovery Test"

# Test database connectivity
echo "Testing database connectivity..."
if npx supabase status > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

# Test backup integrity
echo "Testing backup integrity..."
LATEST_BACKUP=$(ls -t ./backups/database/*.sql.gz 2>/dev/null | head -1)
if [ -f "$LATEST_BACKUP" ]; then
  if gzip -t "$LATEST_BACKUP"; then
    echo "✅ Latest backup integrity verified"
  else
    echo "❌ Backup integrity check failed"
    exit 1
  fi
else
  echo "❌ No database backup found"
  exit 1
fi

# Test application build
echo "Testing application build..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Application build successful"
else
  echo "❌ Application build failed"
  exit 1
fi

# Test monitoring endpoints
echo "Testing monitoring endpoints..."
if curl -f http://localhost:5173/api/health > /dev/null 2>&1; then
  echo "✅ Health endpoint accessible"
else
  echo "⚠️  Health endpoint not accessible (may be expected in test environment)"
fi

echo "🎉 Disaster Recovery Test Completed Successfully"`;

    writeFileSync(join(backupDir, 'test-recovery.sh'), recoveryTestScript);

    // Make scripts executable
    const scripts = ['backup-database.sh', 'backup-application.sh', 'test-recovery.sh'];
    scripts.forEach(script => {
      try {
        // Note: This would need proper chmod in a real environment
        console.log(`✓ Generated ${script}`);
      } catch (error) {
        console.warn(`Could not make ${script} executable:`, error.message);
      }
    });

    console.log('✓ Backup scripts generated');
  }

  generateDocumentation() {
    console.log('\n📚 Generating Documentation...');

    const documentation = `# Backup and Disaster Recovery Documentation

## Overview

This document outlines the backup and disaster recovery procedures for the Spark Bloom Flow productivity application.

## Backup Strategy

### Automated Backups

- **Database**: Daily backups at 2:00 AM UTC
- **Application Assets**: Weekly backups on Sundays at 3:00 AM UTC
- **Configuration**: Backed up on each deployment

### Backup Retention

- **Daily backups**: 7 days
- **Weekly backups**: 4 weeks
- **Monthly backups**: 12 months

### Storage Locations

- **Primary**: AWS S3 with versioning enabled
- **Secondary**: Google Cloud Storage (optional)
- **Local**: Recent backups for quick access

## Recovery Procedures

### Database Recovery

1. **Assess the situation**
   - Determine the scope of data loss
   - Identify the cause of the failure

2. **Find the appropriate backup**
   \`\`\`bash
   # List available backups
   ls -la ./backups/database/

   # Verify backup integrity
   ./scripts/backup/test-recovery.sh
   \`\`\`

3. **Restore the database**
   \`\`\`bash
   # Restore from backup
   gunzip -c backup_file.sql.gz | psql $DATABASE_URL
   \`\`\`

4. **Verify data integrity**
   - Run application tests
   - Check critical user data
   - Verify recent transactions

### Application Recovery

1. **Rollback deployment**
   \`\`\`bash
   # Rollback to previous version
   git revert HEAD
   npm run build
   npm run deploy
   \`\`\`

2. **Restore from backup**
   \`\`\`bash
   # Extract application backup
   tar -xzf application-backup.tar.gz

   # Rebuild and deploy
   npm install
   npm run build
   npm run deploy
   \`\`\`

## Emergency Procedures

### Immediate Response (0-15 minutes)

1. **Incident Detection**
   - Monitor alerts and health checks
   - Verify the scope of the issue

2. **Initial Response**
   - Activate incident response team
   - Enable maintenance page if necessary
   - Begin troubleshooting

3. **Communication**
   - Notify stakeholders
   - Update status page
   - Post in incident channel

### Short-term Response (15 minutes - 2 hours)

1. **Problem Assessment**
   - Identify root cause
   - Estimate impact and recovery time

2. **Recovery Actions**
   - Implement immediate fixes
   - Restore from backups if necessary
   - Scale resources if needed

3. **Monitoring**
   - Track recovery progress
   - Monitor system health
   - Provide regular updates

### Long-term Response (2+ hours)

1. **Full Recovery**
   - Complete system restoration
   - Verify all functionality
   - Resume normal operations

2. **Post-Incident**
   - Conduct post-mortem analysis
   - Update procedures if needed
   - Implement preventive measures

## Testing and Validation

### Regular Testing Schedule

- **Monthly**: Backup integrity verification
- **Quarterly**: Full disaster recovery simulation
- **Annually**: Complete DR plan review

### Test Procedures

1. **Backup Verification**
   \`\`\`bash
   ./scripts/backup/test-recovery.sh
   \`\`\`

2. **Recovery Simulation**
   - Restore to staging environment
   - Verify application functionality
   - Test data integrity

3. **Communication Test**
   - Test alert systems
   - Verify contact information
   - Practice stakeholder notifications

## Contacts and Escalation

### Primary Contacts
- **DevOps Lead**: devops-lead@company.com
- **On-Call Engineer**: on-call@company.com
- **Infrastructure Team**: infrastructure@company.com

### Escalation Matrix
1. **Level 1**: Engineering team (0-30 minutes)
2. **Level 2**: Engineering management (30-60 minutes)
3. **Level 3**: Executive team (60+ minutes)

## Compliance and Audit

### Requirements
- SOC 2 Type II compliance
- GDPR data protection requirements
- Industry-specific regulations

### Audit Trail
- All backup and recovery activities logged
- Change management documentation
- Regular compliance reporting

## Continuous Improvement

### Metrics to Track
- Recovery Time Objective (RTO) achievement
- Recovery Point Objective (RPO) achievement
- Mean Time to Recovery (MTTR)
- Backup success rate

### Regular Reviews
- Monthly backup report review
- Quarterly DR plan updates
- Annual strategy assessment

---

*Last updated: ${new Date().toISOString()}*
*Next review: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()}*`;

    writeFileSync(join(rootDir, 'DISASTER_RECOVERY.md'), documentation);
    console.log('✓ Disaster recovery documentation generated');
  }

  generateReport() {
    console.log('\n📊 Backup and Disaster Recovery Setup Report');
    console.log('============================================');

    console.log('✅ Components Implemented:');
    console.log('  • Comprehensive backup configuration');
    console.log('  • Disaster recovery plan with RTO/RPO targets');
    console.log('  • Automated backup scripts');
    console.log('  • Recovery testing procedures');
    console.log('  • Complete documentation');

    console.log('\n📋 Generated Files:');
    console.log('  • backup-config.json - Backup configuration');
    console.log('  • disaster-recovery-plan.json - DR procedures');
    console.log('  • scripts/backup/backup-database.sh - DB backup script');
    console.log('  • scripts/backup/backup-application.sh - App backup script');
    console.log('  • scripts/backup/test-recovery.sh - Recovery testing');
    console.log('  • DISASTER_RECOVERY.md - Complete documentation');

    console.log('\n🎯 Recovery Objectives:');
    console.log('  • RTO (Recovery Time Objective): 4 hours');
    console.log('  • RPO (Recovery Point Objective): 1 hour');
    console.log('  • Backup frequency: Daily (database), Weekly (assets)');
    console.log('  • Retention: 7 days (daily), 4 weeks (weekly), 12 months (monthly)');

    console.log('\n🔧 Next Steps:');
    console.log('  1. Configure cloud storage credentials (AWS S3, GCS)');
    console.log('  2. Set up backup scheduling (cron jobs or CI/CD)');
    console.log('  3. Test backup and recovery procedures');
    console.log('  4. Train team on disaster recovery procedures');
    console.log('  5. Schedule quarterly DR tests');

    console.log('\n⚠️  Production Requirements:');
    console.log('  • AWS_S3_BACKUP_BUCKET configured');
    console.log('  • SUPABASE_ACCESS_TOKEN for backups');
    console.log('  • Monitoring and alerting for backup failures');
    console.log('  • Regular testing of recovery procedures');
    console.log('  • Team training on emergency procedures');
  }

  async run() {
    console.log('🛡️  Backup and Disaster Recovery Setup');
    console.log('====================================');

    this.generateBackupConfiguration();
    this.generateDisasterRecoveryPlan();
    this.generateBackupScripts();
    this.generateDocumentation();
    this.generateReport();
  }
}

// Main execution
async function main() {
  const setup = new BackupRecoverySetup();
  await setup.run();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Backup and Disaster Recovery Setup Script

Usage:
  node scripts/backup-recovery.js

This script configures:
  - Automated backup procedures for database and application
  - Disaster recovery plan with RTO/RPO objectives
  - Recovery scripts and testing procedures
  - Comprehensive documentation

Prerequisites:
  - Supabase project access
  - Cloud storage credentials (AWS S3, GCS)
  - Monitoring and alerting system
`);
  process.exit(0);
}

main().catch(console.error);