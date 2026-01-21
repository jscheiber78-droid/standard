#!/bin/bash

# Test Script for Personalized Questionnaire API
# Usage: ./test-api.sh [server-url]
# Example: ./test-api.sh http://localhost:3000

SERVER_URL="${1:-http://localhost:3000}"

echo "======================================"
echo "Testing Personalized Questionnaire API"
echo "Server: $SERVER_URL"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $SERVER_URL/health"
RESPONSE=$(curl -s -w "\n%{http_code}" "$SERVER_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Submit Test Questionnaire
echo -e "${YELLOW}Test 2: Submit Test Questionnaire${NC}"
echo "POST $SERVER_URL/apps/personalized-questionnaire/submit"

TEST_DATA='{
  "fullName": "Test User",
  "age": 35,
  "gender": "male",
  "height": 180,
  "weight": 80,
  "email": "test@example.com",
  "selectedAreas": ["energy", "cognition"],
  "sleepQuality": "7",
  "sleepHours": "7.5",
  "stressLevel": "5",
  "exerciseFrequency": "3",
  "smoking": "no",
  "alcoholConsumption": "3",
  "dietQuality": "7",
  "dietType": "omnivore",
  "supplements": "no",
  "orderId": "TEST-12345"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/apps/personalized-questionnaire/submit" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Download CSV
echo -e "${YELLOW}Test 3: Download CSV${NC}"
echo "GET $SERVER_URL/apps/personalized-questionnaire/download-csv"

RESPONSE=$(curl -s -w "\n%{http_code}" "$SERVER_URL/apps/personalized-questionnaire/download-csv" -o test-download.csv)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    if [ -f "test-download.csv" ]; then
        LINE_COUNT=$(wc -l < test-download.csv)
        echo "CSV downloaded successfully"
        echo "Lines in CSV: $LINE_COUNT"
        echo "First few lines:"
        head -n 3 test-download.csv
        rm test-download.csv
    fi
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "HTTP Code: $HTTP_CODE"
fi
echo ""

# Test 4: Manual Email Trigger (optional)
echo -e "${YELLOW}Test 4: Manual Email Trigger (Optional)${NC}"
read -p "Do you want to test email sending? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "POST $SERVER_URL/apps/personalized-questionnaire/send-email"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL/apps/personalized-questionnaire/send-email")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "Response: $BODY"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "HTTP Code: $HTTP_CODE"
        echo "Response: $BODY"
    fi
else
    echo "Skipped"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Server: $SERVER_URL"
echo "All basic tests completed."
echo ""
echo "Next steps:"
echo "1. Check logs: pm2 logs personalized-api"
echo "2. Check data directory: ls -la ./data/"
echo "3. Verify CSV file: cat ./data/questionnaire-responses.csv"
echo "4. If email test was run, check your inbox"
echo ""
