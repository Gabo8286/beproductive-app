#!/bin/bash

# Automated TODO Check Script
# Run as part of CI/CD pipeline

echo "🔍 Checking for TODO/FIXME comments..."

# Count todos
TODOS=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts*" | wc -l)

echo "Found $TODOS TODO/FIXME/XXX comments"

# Check if count is increasing
if [ -f ".todo-count" ]; then
    PREV_COUNT=$(cat .todo-count)
    if [ "$TODOS" -gt "$PREV_COUNT" ]; then
        echo "❌ TODO count increased from $PREV_COUNT to $TODOS"
        echo "New TODOs added:"
        grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts*" -n | tail -n $((TODOS - PREV_COUNT))
        exit 1
    elif [ "$TODOS" -lt "$PREV_COUNT" ]; then
        echo "✅ TODO count decreased from $PREV_COUNT to $TODOS"
    else
        echo "➡️ TODO count unchanged: $TODOS"
    fi
else
    echo "📝 First run, recording baseline: $TODOS"
fi

# Save current count
echo "$TODOS" > .todo-count

# List critical TODOs (FIXME and XXX)
CRITICAL=$(grep -r "FIXME\|XXX" src/ --include="*.ts*" | wc -l)
if [ "$CRITICAL" -gt 0 ]; then
    echo ""
    echo "⚠️ Critical TODOs found:"
    grep -r "FIXME\|XXX" src/ --include="*.ts*" -n
fi

echo "✅ TODO check complete"
