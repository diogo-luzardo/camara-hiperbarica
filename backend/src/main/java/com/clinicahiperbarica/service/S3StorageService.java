package com.clinicahiperbarica.service;

import com.clinicahiperbarica.dto.UploadResponse;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@ApplicationScoped
public class S3StorageService {

    @ConfigProperty(name = "clinica.s3.bucket-name", defaultValue = "clinica-ohb-prontuarios")
    String bucketName;

    @ConfigProperty(name = "quarkus.s3.aws.region", defaultValue = "us-east-1")
    String awsRegion;

    private S3Presigner getPresigner() {
        return S3Presigner.builder()
                .region(Region.of(awsRegion))
                .build();
    }

    /**
     * Gera uma Pre-Signed URL segura para o Frontend/Tablet fazer upload direto para o S3
     */
    public UploadResponse generatePresignedUploadUrl(String registroOHB, String filename, String contentType) {
        String safeRegistro = (registroOHB != null && !registroOHB.trim().isEmpty()) 
            ? registroOHB.replaceAll("[^a-zA-Z0-9-_]", "") 
            : "geral";
        
        String safeExt = "";
        if (filename != null && filename.contains(".")) {
            safeExt = filename.substring(filename.lastIndexOf("."));
        } else if ("image/jpeg".equalsIgnoreCase(contentType)) {
            safeExt = ".jpg";
        } else if ("image/png".equalsIgnoreCase(contentType)) {
            safeExt = ".png";
        } else if ("application/pdf".equalsIgnoreCase(contentType)) {
            safeExt = ".pdf";
        }

        String uniqueFileName = UUID.randomUUID() + safeExt;
        String s3Key = "prontuarios/" + safeRegistro + "/" + uniqueFileName;

        try (S3Presigner presigner = getPresigner()) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // Válido por 10 minutos
                    .putObjectRequest(putObjectRequest)
                    .build();

            String uploadUrl = presigner.presignPutObject(presignRequest).url().toString();
            String publicUrl = "https://" + bucketName + ".s3." + awsRegion + ".amazonaws.com/" + s3Key;

            return new UploadResponse(uploadUrl, s3Key, publicUrl, 600);
        }
    }

    /**
     * Gera uma Pre-Signed URL temporária para visualização de prontuários em buckets privados
     */
    public String generatePresignedDownloadUrl(String s3Key) {
        if (s3Key == null || s3Key.trim().isEmpty()) {
            return null;
        }

        try (S3Presigner presigner = getPresigner()) {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(30)) // Válido por 30 minutos
                    .getObjectRequest(getObjectRequest)
                    .build();

            return presigner.presignGetObject(presignRequest).url().toString();
        }
    }
}
