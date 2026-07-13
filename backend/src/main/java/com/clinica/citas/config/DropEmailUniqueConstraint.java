package com.clinica.citas.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Temporal: elimina la restriccion UNIQUE de usuarios.email en PostgreSQL (Render).
 * Hibernate ddl-auto=update no borra uniques existentes.
 * Quitar este componente cuando se reactive la validacion de email unico.
 */
@Component
@Profile("prod")
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DropEmailUniqueConstraint implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer dropped = jdbcTemplate.queryForObject("""
                    SELECT COUNT(*)::int FROM (
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
                    ) x
                    """, Integer.class);

            jdbcTemplate.execute("""
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
                    """);

            jdbcTemplate.execute("DROP INDEX IF EXISTS usuarios_email_key");

            if (dropped != null && dropped > 0) {
                log.warn("Restriccion UNIQUE de usuarios.email eliminada (temporal). Constraints removidos: {}", dropped);
            } else {
                log.info("No habia UNIQUE activo en usuarios.email (o ya fue eliminado).");
            }
        } catch (Exception ex) {
            log.error("No se pudo eliminar UNIQUE de usuarios.email: {}", ex.getMessage());
        }
    }
}
