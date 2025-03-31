/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select database
use('embra_connect_dev');

// Insert sample users
db.getCollection('users').insertMany([
    { "_id": ObjectId(), "email": "ec_user@company.com", "password": "4FL8fChd)s4Z<2916!", "created_at": new Date() },
    { "_id": ObjectId(), "email": "ec_admin@company.com", "password": "4FL8fChd)s4Z<2916!", "created_at": new Date() }
]);

// Insert sample workspaces
db.getCollection('workspaces').insertMany([
    { "_id": ObjectId(), "tag": "Sample Workspace A", "owner": "ec_user@company.com", "created_at": new Date() },
    { "_id": ObjectId(), "tag": "Sample Workspace B", "owner": "ec_admin@company.com", "created_at": new Date() }
]);

// Insert sample projects
db.getCollection('projects').insertMany([
    { "_id": ObjectId(), "tag": "Project Alpha", "workspace": "Sample Workspace A", "owner": "ec_user@company.com", "created_at": new Date() },
    { "_id": ObjectId(), "tag": "Project Beta", "workspace": "Sample Workspace B", "owner": "ec_admin@company.com", "created_at": new Date() }
]);

// Find all users
const userCount = db.getCollection('users').find().count();
console.log(`Total users: ${userCount}`);

// Count workspaces per user
const workspaceCount = db.getCollection('workspaces').aggregate([
    { $group: { _id: "$owner", count: { $sum: 1 } } }
]).toArray();

console.log("Workspaces per user:", workspaceCount);
