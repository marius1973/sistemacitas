package com.clinica.citas.repository;

import com.clinica.citas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Temporal: con emails duplicados, usa el usuario mas reciente.
     * Preferir metodo Spring Data (no native query) para mapear bien herencia JOINED.
     */
    Optional<Usuario> findFirstByEmailOrderByIdDesc(String email);

    default Optional<Usuario> findByEmail(String email) {
        return findFirstByEmailOrderByIdDesc(email);
    }

    boolean existsByEmail(String email);
}
