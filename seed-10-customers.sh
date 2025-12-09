#!/bin/bash
cd ~/ctss && git pull origin main && API_URL=http://72.61.119.247 node scripts/seed-customers-api.js

