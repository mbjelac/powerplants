#!/bin/bash
PROMPT=$(jq -r '.prompt')
if echo "$PROMPT" | grep -qi '^create sektor$'; then
  cd /Users/mbjelac/Documents/projects/sektor/creator
  source ~/.nvm/nvm.sh
  nvm use --silent >/dev/null 2>&1
  OUTPUT=$(npx tsx createSektor.ts 2>&1)
  jq -n --arg ctx "Creator tool output:\n$OUTPUT" '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":$ctx}}'
fi
