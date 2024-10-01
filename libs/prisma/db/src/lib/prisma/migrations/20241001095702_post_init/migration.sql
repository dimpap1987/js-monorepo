-- This is an empty migration.-- This is an empty migration.-- Step 1: Insert Roles
INSERT INTO roles (name) VALUES ('ADMIN'), ('USER');

-- Step 2: Insert Providers
INSERT INTO providers (name) VALUES ('GOOGLE'), ('GITHUB');

-- Step 3: Insert Admin User
INSERT INTO auth_users (username, email, "updatedAt")
VALUES ('GOD', 'mits0s200efta@gmail.com', NOW());

-- Step 4: Link User to ADMIN Role in UserRoles Table
INSERT INTO user_role ("userId", "roleId", "updatedAt")
VALUES ((SELECT id FROM auth_users WHERE username = 'GOD'), (SELECT id FROM roles WHERE name = 'ADMIN'), NOW());

-- Step 5: Insert User Profile
INSERT INTO user_profiles ("userId", "providerId", "profileImage", "updatedAt")
VALUES ((SELECT id FROM auth_users WHERE username = 'GOD'), 1, NULL, NOW());

-- Step 6: Insert into Channels (if applicable)
INSERT INTO channels (name, description) 
VALUES ('global', 'This is the global channel where all users are registered');