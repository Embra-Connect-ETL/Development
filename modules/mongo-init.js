// Connect to the admin database
db = db.getSiblingDB("admin");

// Create [root] if they don't exist
const user = db.system.users.findOne({ user: "ec_root" });

if (!user) {
    db.createUser({
        user: "ec_root",
        pwd: "PWD",
        roles: [{ role: "root", db: "admin" }]
    });
    print("Root user created.");
} else {
    print("Root user already exists. Skipping creation.");
}


// Switch to the embraconnect database
db = db.getSiblingDB("embra_connect_dev");

// Create collections
db.createCollection("users");
db.createCollection("workspaces");
db.createCollection("projects");

// Create a non-root user
db.createUser({
    user: "ec_user",
    pwd: "LwGMuUEYGW_3976!",
    roles: [{ role: "readWrite", db: "embra_connect_dev" }]
});

print("MongoDB initialization script executed successfully!");
