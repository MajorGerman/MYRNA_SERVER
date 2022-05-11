//create roles
let query = 
`INSERT INTO roles (name)
VALUES ('user'),
('administrator'),
('super-admin')`
// registration
let query = 
`INSERT INTO users (mail ,pass, salt) 
VALUES ('${name}','${mail}', ${pass},${salt})`;

// getting user
let query = 
`SELECT () FROM users 
WHERE id = ${id}`;

let query =
``