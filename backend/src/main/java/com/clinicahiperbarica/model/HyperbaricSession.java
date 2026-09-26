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
@Table(name = "hyperbaric_sessions", indexes = {
    @Index(name = "idx_session_patient", columnList = "patient_id"),
    @Index(name = "idx_session_date", columnList = "data"),
    @Index(name = "idx_session_registro_ohb", columnList = "registro_ohb")
})
public class HyperbaricSession extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public Patient patient;

    @Column(name = "registro_ohb", nullable = false, length = 30)
    public String registroOHB;

    @Column(name = "session_number", nullable = false)
    public Integer sessionNumber;

    @Column(nullable = false)
    public LocalDate data;

    @Column(length = 10)
    public String hora; // Ex: "14:30"

    @Column(precision = 4, scale = 2)
    public BigDecimal ata; // Ex: 2.00, 2.40

    @Column(length = 20)
    public String pa; // Ex: 120/80 mmHg

    @Column(length = 20)
    public String glicemia; // mg/dL

    @Column(length = 20)
    public String temperatura; // °C

    @Column(name = "duracao_minutos")
    public Integer duracaoMinutos; // Ex: 90

    @Column(name = "tratamento_medicacao", length = 255)
    public String tratamentoMedicacao;

    @Column(columnDefinition = "TEXT")
    public String intercorrencias;

    @Column(name = "medico_responsavel", length = 255)
    public String medicoResponsavel;

    @Column(name = "enfermeiro_responsavel", length = 255)
    public String enfermeiroResponsavel;

    @Column(name = "tecnico_responsavel", length = 255)
    public String tecnicoResponsavel;

    // --- Checagens de Segurança da Câmara (Sistematização de Enfermagem / Risco de Incêndio em O2 puro) ---
    @Column(name = "conferencia_nome")
    public Boolean conferenciaNome;

    @Column(name = "roupa_algodao")
    public Boolean roupaAlgodao;

    @Column(name = "pulseira_estatica")
    public Boolean pulseiraEstatica;

    @Column(name = "remover_metais_eletronicos")
    public Boolean removerMetaisEletronicos;

    @Column(name = "retirar_proteses")
    public Boolean retirarProteses;

    @Column(name = "sonda_vesical_aberta")
    public Boolean sondaVesicalAberta;

    @Column(name = "avp_avc_picc")
    public Boolean avpAvcPicc;

    @Column(name = "velocidade_compressao", length = 50)
    public String velocidadeCompressao;

    @Column(name = "velocidade_descompressao", length = 50)
    public String velocidadeDescompressao;

    @Column(name = "covid_febre_tosse")
    public Boolean covidFebreTosse;

    // --- Diagnósticos de Enfermagem (PR: Presente, ME: Melhorado, PI: Piorado, A: Ausente, R: Resolvido) ---
    @Column(name = "diag_dor", length = 5)
    public String diagDor;

    @Column(name = "diag_queda", length = 5)
    public String diagQueda;

    @Column(name = "diag_deambulacao", length = 5)
    public String diagDeambulacao;

    @Column(name = "diag_glicemia", length = 5)
    public String diagGlicemia;

    @Column(name = "diag_pele", length = 5)
    public String diagPele;

    @Column(name = "diag_contaminacao", length = 5)
    public String diagContaminacao;

    @Column(name = "diag_ansiedade", length = 5)
    public String diagAnsiedade;

    @Column(name = "evolucao_enfermagem", columnDefinition = "TEXT")
    public String evolucaoEnfermagem;

    @Column(length = 30)
    public String status; // 'agendada', 'em_andamento', 'concluida', 'cancelada'

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

    public static List<HyperbaricSession> findByPatientId(UUID patientId) {
        return list("patient.id = ?1 and deletedAt is null order by sessionNumber desc", patientId);
    }

    public static List<HyperbaricSession> findByRegistroOHB(String registroOHB) {
        return list("registroOHB = ?1 and deletedAt is null order by sessionNumber desc", registroOHB);
    }
}
