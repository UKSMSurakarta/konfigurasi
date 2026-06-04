#!/usr/bin/env bash

#
# Health Check Setup Script
# Script untuk setup dan configure health check protection
#
# Usage: bash setup-health-check.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    Health Check Security Setup${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ Error: .env file not found!${NC}"
    echo "Please run this script from the Laravel root directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Generate secure health check token${NC}"
echo ""

# Generate a secure token
TOKEN=$(php -r "echo bin2hex(random_bytes(32));")
echo -e "${GREEN}✓ Generated token: ${NC}${BLUE}${TOKEN}${NC}"
echo ""

# Ask user if they want to update .env
read -p "Do you want to update .env with this token? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Update or add HEALTH_CHECK_TOKEN to .env
    if grep -q "^HEALTH_CHECK_TOKEN=" .env; then
        # Replace existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^HEALTH_CHECK_TOKEN=.*/HEALTH_CHECK_TOKEN=${TOKEN}/" .env
        else
            sed -i "s/^HEALTH_CHECK_TOKEN=.*/HEALTH_CHECK_TOKEN=${TOKEN}/" .env
        fi
    else
        # Append new
        echo "" >> .env
        echo "HEALTH_CHECK_TOKEN=${TOKEN}" >> .env
    fi
    echo -e "${GREEN}✓ Updated .env file${NC}"
else
    echo -e "${YELLOW}! Skipped .env update${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Configure IP Whitelist (optional)${NC}"
echo ""
echo "Current IP whitelist configuration in .env:"

if grep -q "^HEALTH_CHECK_IPS=" .env; then
    CURRENT_IPS=$(grep "^HEALTH_CHECK_IPS=" .env | cut -d= -f2-)
    echo -e "${BLUE}  $CURRENT_IPS${NC}"
else
    echo -e "${YELLOW}  (not set - only token authentication will be used)${NC}"
fi

echo ""
read -p "Do you want to configure IP whitelist? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter IPs to whitelist (comma-separated, e.g., 127.0.0.1,192.168.1.10): " IPS
    
    if [ -z "$IPS" ]; then
        echo -e "${YELLOW}! No IPs provided, skipping${NC}"
    else
        if grep -q "^HEALTH_CHECK_IPS=" .env; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/^HEALTH_CHECK_IPS=.*/HEALTH_CHECK_IPS=${IPS}/" .env
            else
                sed -i "s/^HEALTH_CHECK_IPS=.*/HEALTH_CHECK_IPS=${IPS}/" .env
            fi
        else
            echo "HEALTH_CHECK_IPS=${IPS}" >> .env
        fi
        echo -e "${GREEN}✓ Updated IP whitelist${NC}"
    fi
else
    echo -e "${YELLOW}! Skipped IP whitelist configuration${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Enable/Disable Health Check${NC}"
echo ""

if grep -q "^HEALTH_CHECK_ENABLED=" .env; then
    CURRENT=$(grep "^HEALTH_CHECK_ENABLED=" .env | cut -d= -f2-)
    echo "Current status: ${BLUE}${CURRENT}${NC}"
else
    echo "Current status: ${YELLOW}(not set - default: true)${NC}"
fi

echo ""
read -p "Enable health check? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if grep -q "^HEALTH_CHECK_ENABLED=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^HEALTH_CHECK_ENABLED=.*/HEALTH_CHECK_ENABLED=true/" .env
        else
            sed -i "s/^HEALTH_CHECK_ENABLED=.*/HEALTH_CHECK_ENABLED=true/" .env
        fi
    else
        echo "HEALTH_CHECK_ENABLED=true" >> .env
    fi
    echo -e "${GREEN}✓ Health check enabled${NC}"
else
    if grep -q "^HEALTH_CHECK_ENABLED=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^HEALTH_CHECK_ENABLED=.*/HEALTH_CHECK_ENABLED=false/" .env
        else
            sed -i "s/^HEALTH_CHECK_ENABLED=.*/HEALTH_CHECK_ENABLED=false/" .env
        fi
    else
        echo "HEALTH_CHECK_ENABLED=false" >> .env
    fi
    echo -e "${YELLOW}! Health check disabled${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Test Health Check${NC}"
echo ""

read -p "Do you want to test the health check endpoint? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    APP_URL=$(grep "^APP_URL=" .env | cut -d= -f2-)
    
    echo -e "${BLUE}Testing endpoints:${NC}"
    echo ""
    
    echo "1. Testing with token header:"
    echo "   curl -H \"X-Health-Check-Token: ${TOKEN}\" ${APP_URL}/health"
    echo ""
    
    echo "2. Testing simple health check:"
    echo "   curl -H \"X-Health-Check-Token: ${TOKEN}\" ${APP_URL}/health/up"
    echo ""
    
    echo "3. Testing without authorization (should fail):"
    echo "   curl ${APP_URL}/health"
    echo ""
fi

echo ""
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "  - Token: ${BLUE}${TOKEN}${NC}"
echo "  - Token added to: ${BLUE}.env (HEALTH_CHECK_TOKEN)${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update your monitoring tools to use:"
echo "     - URL: /health/up (simple) or /health (detailed)"
echo "     - Header: X-Health-Check-Token: ${TOKEN}"
echo "  2. Or configure IP whitelist in HEALTH_CHECK_IPS"
echo "  3. Test the endpoint to verify it's working"
echo ""
echo -e "${BLUE}Documentation: SECURITY_HEALTHCHECK_PROTECTION.md${NC}"
echo ""
