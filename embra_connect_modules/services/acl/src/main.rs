// Define structs to represent users, resources, and permissions.
// Create functions to add users, resources, and permissions to the ACL.
// Implement functions to check if a user has permission to access a resource.

use std::collections::{HashMap, HashSet};

// Struct representing a user
#[derive(Debug, PartialEq, Eq, Hash)]
struct User {
    username: String,
}

// Struct representing a resource
#[derive(Debug, PartialEq, Eq, Hash)]
struct Resource {
    name: String,
}

// Enum representing permissions
#[derive(Debug, PartialEq, Eq, Hash)]
enum Permission {
    Read,
    Write,
    Execute,
}

// Struct representing an Access Control List
struct Acl {
    user_permissions: HashMap<User, HashSet<(Resource, Permission)>>,
}

impl Acl {
    // Function to create a new ACL
    fn new() -> Self {
        Acl {
            user_permissions: HashMap::new(),
        }
    }

    // Function to add permissions for a user on a resource
    fn add_permission(&mut self, user: User, resource: Resource, permission: Permission) {
        self.user_permissions
            .entry(user)
            .or_insert_with(HashSet::new)
            .insert((resource, permission));
    }

    // Function to check if a user has permission to access a resource
    fn check_permission(&self, user: &User, resource: &Resource, permission: &Permission) -> bool {
        if let Some(permissions) = self.user_permissions.get(user) {
            permissions.contains(&(resource.clone(), permission.clone()))
        } else {
            false
        }
    }
}

fn main() {
    // Create a new ACL
    let mut acl = Acl::new();

    // Define users
    let user1 = User {
        username: "user1".to_string(),
    };
    let user2 = User {
        username: "user2".to_string(),
    };

    // Define resources
    let resource1 = Resource {
        name: "resource1".to_string(),
    };

    // Add permissions
    acl.add_permission(user1.clone(), resource1.clone(), Permission::Read);
    acl.add_permission(user2.clone(), resource1.clone(), Permission::Write);

    // Check permissions
    println!(
        "User1 has read permission on resource1: {}",
        acl.check_permission(&user1, &resource1, &Permission::Read)
    );
    println!(
        "User1 has write permission on resource1: {}",
        acl.check_permission(&user1, &resource1, &Permission::Write)
    );
    println!(
        "User2 has read permission on resource1: {}",
        acl.check_permission(&user2, &resource1, &Permission::Read)
    );
    println!(
        "User2 has write permission on resource1: {}",
        acl.check_permission(&user2, &resource1, &Permission::Write)
    );
}
