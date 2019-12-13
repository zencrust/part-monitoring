# Part monitor client app
Client dashboard app for showing stations needing attention

[![Build Status](https://dev.azure.com/automationkarthik/partalarm/_apis/build/status/zencrust.part-monitoring?branchName=master)](https://dev.azure.com/automationkarthik/partalarm/_build/latest?definitionId=9&branchName=master)

## Commands to build
Use yarn install and yarn start to debug the application 

## Deployment

Note:
Run chrome with  --autoplay-policy=no-user-gesture-required flag to run in kiosk mode
for example use
from ~/.config/lxsession/LXDE-pi/autostart
@chromium-browser --autoplay-policy=no-user-gesture-required --incognito --kiosk http://smartdashboard.local:3000/

Or use chrome tab to expcitly set sound to allow not allow(default)

This will enable auto play alarms which is blocked by default in chrome 74+
