# Bot Deployment Tracker

## Description

This bot alerts every time when a new bot is deployed from Nethermind address 

## Supported Chains

- Polygon

## Alerts

- NETHERMIND-1
  - Fired when a new bot is deployed by Nethermind Address: 0x88dc3a2284fa62e0027d6d6b1fcfdd2141a143b8
  - Severity is always set to "info" 
  - Type is always set to "info" 
  - Metadata contains:
  agentId : agentId of the bot
  metadata : metadata of the bot
  chainIds : chainIds of the bot

## Test Data

The bot behaviour can be verified with the following transactions:

- 0x906bab9359843c22f35d12fbe8c08cf76311de356d1fff77265ab70e0e3a89da (https://polygonscan.com/tx/0x906bab9359843c22f35d12fbe8c08cf76311de356d1fff77265ab70e0e3a89da)
