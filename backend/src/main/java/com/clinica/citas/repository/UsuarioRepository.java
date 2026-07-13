package com.clinica.citas.repository;

import com.clinica.citas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Temporal: con emails duplicados permitidos, toma el usuario mas reciente.
     * Volver a findByEmail simple cuando se reactive UNIQUE.
     */
    @Query(value = "SELECT * FROM usuarios WHERE email = :email ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Usuario> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);
}
