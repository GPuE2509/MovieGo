#!/bin/bash
cd /home/site/wwwroot
java -Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseStringDeduplication -jar app.jar 