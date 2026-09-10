package com.clinicahiperbarica.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appointment_date", columnList = "data"),
    @Index(name = "idx_appointment_patient", columnList = "patient_id"),
    @Index(name = "idx_appointment_registro_ohb", columnList = "registro_ohb")
})
public class Appointment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public Patient patient;

    @Column(name = "patient_name", length = 255)
    public String patientName;

    @Column(name = "registro_ohb", length = 30)
    public String registroOHB;

    @Column(length = 20)
    public String cpf;

    @Column(nullable = false)
    public LocalDate data;

    @Column(nullable = false, length = 10)
    public String horario; // "08:00", "09:30"

    @Column(name = "dia_semana", length = 30)
    public String diaSemana;

    @Column(name = "sessao_numero")
    public Integer sessaoNumero;

    @Column(name = "pressao_ata", precision = 4, scale = 2)
    public BigDecimal pressaoATA;

    @Column(length = 30)
    public String status; // 'agendado', 'confirmado', 'realizado', 'cancelado'

    @Column(columnDefinition = "TEXT")
    public String observacoes;

    @Column(name = "telefone_paciente", length = 50)
    public String telefonePaciente;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    public LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static List<Appointment> findByDate(LocalDate date) {
        return list("data = ?1 and deletedAt is null order by horario asc", date);
    }

    public static List<Appointment> findByPatientId(UUID patientId) {
        return list("patient.id = ?1 and deletedAt is null order by data desc, horario desc", patientId);
    }
}
