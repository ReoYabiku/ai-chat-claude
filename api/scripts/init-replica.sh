#!/bin/bash

# Wait for MongoDB to be ready
sleep 10

# Initialize replica set
mongosh <<INITEOF
use admin
db.auth('admin', 'password123')

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017" }
  ]
})
INITEOF

echo "Replica set initialized successfully"
