package com.clinicahiperbarica.dto;

public class UploadResponse {
    public String uploadUrl; // Pre-signed URL para PUT direto no S3
    public String s3Key;     // Chave do objeto gravada no S3
    public String publicUrl; // URL final para visualização
    public long expiresInSeconds;

    public UploadResponse() {}

    public UploadResponse(String uploadUrl, String s3Key, String publicUrl, long expiresInSeconds) {
        this.uploadUrl = uploadUrl;
        this.s3Key = s3Key;
        this.publicUrl = publicUrl;
        this.expiresInSeconds = expiresInSeconds;
    }
}
