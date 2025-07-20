#!/bin/bash

# Test script to verify drag-and-drop reordering persistence

echo "Testing drag-and-drop reordering..."

# Get commands for General category, Reconnaissance phase
echo "1. Getting current General/Reconnaissance commands..."
curl -s http://localhost:9000/api/commands | jq '.[] | select(.phase == "Reconnaissance" and .category.type == "General") | {id: ._id, name: .name, order: .order}' | jq -s 'sort_by(.order)'

echo -e "\n2. Simulating reorder operation..."
# Get the actual command IDs for General/Reconnaissance
COMMANDS=$(curl -s http://localhost:9000/api/commands | jq -r '.[] | select(.phase == "Reconnaissance" and .category.type == "General") | ._id' | head -4)
COMMANDS_ARRAY=(${COMMANDS})

# Create reorder payload - let's reverse the first two commands
REORDER_DATA="[{\"id\":\"${COMMANDS_ARRAY[1]}\",\"order\":10000},{\"id\":\"${COMMANDS_ARRAY[0]}\",\"order\":10001}"

if [ ${#COMMANDS_ARRAY[@]} -gt 2 ]; then
    REORDER_DATA="${REORDER_DATA},{\"id\":\"${COMMANDS_ARRAY[2]}\",\"order\":10002}"
fi
if [ ${#COMMANDS_ARRAY[@]} -gt 3 ]; then
    REORDER_DATA="${REORDER_DATA},{\"id\":\"${COMMANDS_ARRAY[3]}\",\"order\":10003}"
fi
REORDER_DATA="${REORDER_DATA}]"

# Send reorder request
echo "Sending reorder request..."
curl -s -X PUT -H "Content-Type: application/json" \
     -d "{\"commands\":${REORDER_DATA}}" \
     http://localhost:9000/api/commands/reorder

echo -e "\n3. Getting commands after reorder..."
curl -s http://localhost:9000/api/commands | jq '.[] | select(.phase == "Reconnaissance" and .category.type == "General") | {id: ._id, name: .name, order: .order}' | jq -s 'sort_by(.order)'

echo -e "\nTest completed!"
