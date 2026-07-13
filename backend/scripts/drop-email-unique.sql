-- Temporal: permite emails duplicados en usuarios.
-- Ejecutar en PostgreSQL (Render) si el registro sigue fallando por unique constraint.
-- Reactivar unique en Usuario.email y volver a crear el índice cuando se restaure la validación.

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'usuarios'
      AND c.contype = 'u'
      AND EXISTS (
        SELECT 1
        FROM unnest(c.conkey) AS colnum
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = colnum
        WHERE a.attname = 'email'
      )
  LOOP
    EXECUTE format('ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS usuarios_email_key;
