ALTER TABLE
  server_roles
ADD COLUMN
  role_type INT NOT NULL;

ALTER TABLE
  server_roles
 DROP CONSTRAINT
  server_roles_server_id_key;
