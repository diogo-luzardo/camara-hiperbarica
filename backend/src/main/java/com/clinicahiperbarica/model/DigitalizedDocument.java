package com.clinicahiperbarica.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "digitalized_documents", indexes = {
    @Index(name = "idx_doc_patient", columnList = "patient_id"),
    @Index(name = "idx_doc_session", columnList = "session_id"),
    @Index(name = "idx_doc_registro_ohb", columnList = "registro_ohb"),
    @Index(name = "idx_doc_cpf", columnList = "cpf")
})
public class DigitalizedDocument extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public Patient patient;

    @ManyToOne
    @JoinColumn(name = "session_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public HyperbaricSession session;

    @Column(name = "registro_ohb", length = 30)
    public String registroOHB;

    @Column(length = 20)
    public String cpf;

    @Column(name = "patient_name", length = 255)
    public String patientName;

    @Column(name = "nome_mae", length = 255)
    public String nomeMae;

    @Column(nullable = false, length = 255)
    public String titulo;

    @Column(nullable = false, length = 50)
    public String tipo; // 'prontuario_antigo', 'ficha_atendimento', 'foto_lesao', 'exame_laudo', 'outro'

    @Column(name = "data_documento")
    public LocalDate dataDocumento;

    @Column(name = "data_upload", nullable = false)
    public LocalDateTime dataUpload;

    @Column(columnDefinition = "TEXT")
    public String observacoes;

    @Column(name = "s3_key", length = 500)
    public String s3Key; // Caminho dentro do bucket S3

    @Column(name = "image_url", columnDefinition = "TEXT")
    public String imageUrl; // URL pública ou pré-assinada

    @Column(name = "tamanho_kb")
    public Integer tamanhoKb;

    @Column(name = "deleted_at")
    public LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        if (dataUpload == null) {
            dataUpload = LocalDateTime.now();
        }
    }

    public static List<DigitalizedDocument> findByPatientId(UUID patientId) {
        return list("patient.id = ?1 and deletedAt is null order by dataUpload desc", patientId);
    }

    public static List<DigitalizedDocument> findByRegistroOHB(String registroOHB) {
        return list("registroOHB = ?1 and deletedAt is null order by dataUpload desc", registroOHB);
    }

    public static List<DigitalizedDocument> findBySessionId(UUID sessionId) {
        return list("session.id = ?1 and deletedAt is null order by dataUpload desc", sessionId);
    }
}
