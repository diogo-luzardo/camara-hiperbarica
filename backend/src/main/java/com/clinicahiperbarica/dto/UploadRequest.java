package com.clinicahiperbarica.dto;

import java.util.UUID;

public class UploadRequest {
    public UUID patientId;
    public UUID sessionId;
    public String filename;
    public String contentType; // Ex: "image/jpeg", "image/png", "application/pdf"
    public String tipo; // 'prontuario_antigo', 'foto_lesao', 'exame_laudo'
    public String titulo;
}
