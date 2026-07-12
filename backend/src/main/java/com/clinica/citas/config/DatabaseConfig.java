package com.clinica.citas.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Convierte DATABASE_URL de Render (postgresql://...) al formato JDBC de Spring.
 * Si SPRING_DATASOURCE_URL ya esta definida como JDBC, Spring Boot la usa directamente.
 */
@Configuration
@Profile("prod")
@ConditionalOnProperty(name = "DATABASE_URL")
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        if (databaseUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL no puede estar vacia");
        }

        URI uri = URI.create(databaseUrl.replaceFirst("^postgres(ql)?://", "http://"));
        String username = extraerUsuario(uri.getUserInfo());
        String password = extraerPassword(uri.getUserInfo());

        String jdbcUrl = "jdbc:postgresql://" + uri.getHost()
                + (uri.getPort() > 0 ? ":" + uri.getPort() : "")
                + uri.getPath()
                + "?sslmode=require";

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }

    private String extraerUsuario(String userInfo) {
        if (userInfo == null || !userInfo.contains(":")) {
            return "";
        }
        return URLDecoder.decode(userInfo.split(":", 2)[0], StandardCharsets.UTF_8);
    }

    private String extraerPassword(String userInfo) {
        if (userInfo == null || !userInfo.contains(":")) {
            return "";
        }
        return URLDecoder.decode(userInfo.split(":", 2)[1], StandardCharsets.UTF_8);
    }
}
