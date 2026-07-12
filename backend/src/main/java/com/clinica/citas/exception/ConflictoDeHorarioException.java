package com.clinica.citas.exception;

public class ConflictoDeHorarioException extends RuntimeException {
    public ConflictoDeHorarioException(String mensaje) {
        super(mensaje);
    }
}
