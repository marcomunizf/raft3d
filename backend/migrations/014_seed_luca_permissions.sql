UPDATE users
SET permissions = ARRAY['producao']::TEXT[]
WHERE email = 'luca'
  AND is_active = TRUE
  AND (
    permissions IS NULL
    OR cardinality(permissions) = 0
  );
