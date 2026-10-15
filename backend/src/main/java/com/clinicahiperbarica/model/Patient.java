package com.clinicahiperbarica.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_registro_ohb", columnList = "registro_ohb", unique = true),
    @Index(name = "idx_patient_cpf", columnList = "cpf")
})
public class Patient extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "registro_ohb", nullable = false, unique = true, length = 30)
    public String registroOHB;

    @Column(name = "registro_hospitalar", length = 50)
    public String registroHospitalar;

    @Column(length = 150)
    public String unidade;

    @Column(nullable = false, length = 255)
    public String nome;

    @Column(length = 100)
    public String convenio;

    @Column(length = 100)
    public String plano;

    @Column(name = "matricula_convenio", length = 100)
    public String matriculaConvenio;

    @Column(name = "validade_convenio", length = 20)
    public String validadeConvenio;

    @Column(name = "data_nascimento")
    public LocalDate dataNascimento;

    public Integer idade;

    @Column(length = 10)
    public String sexo; // 'M', 'F', 'Outro'

    @Column(name = "estado_civil", length = 50)
    public String estadoCivil;

    @Column(length = 30)
    public String rg;

    @Column(length = 20)
    public String cpf;

    @Column(length = 100)
    public String profissao;

    @Column(name = "nome_mae", length = 255)
    public String nomeMae;

    @Column(length = 20)
    public String cep;

    @Column(length = 255)
    public String endereco;

    @Column(length = 30)
    public String numero;

    @Column(length = 100)
    public String complemento;

    @Column(length = 100)
    public String bairro;

    @Column(length = 100)
    public String municipio;

    @Column(length = 10)
    public String uf;

    @Column(name = "telefones_fixos", length = 100)
    public String telefonesFixos;

    @Column(length = 50)
    public String celular;

    @Column(length = 150)
    public String email;

    @Column(length = 255)
    public String procedencia;

    @Column(length = 100)
    public String remocao;

    @Column(name = "medico_indicou", length = 255)
    public String medicoIndicou;

    @Column(length = 255)
    public String acompanhante;

    @Column(name = "historia_clinica", columnDefinition = "TEXT")
    public String historiaClinica;

    @Column(name = "exame_fisico_resumido", columnDefinition = "TEXT")
    public String exameFisicoResumido;

    @Column(name = "local_curativos", length = 255)
    public String localCurativos;

    @Column(name = "avaliacao_dor")
    public Integer avaliacaoDor; // 0 a 10

    @Column(name = "grau_entendimento", length = 100)
    public String grauEntendimento;

    @Column(name = "tempo_existencia_patologia", length = 100)
    public String tempoExistenciaPatologia;

    @Column(name = "descricao_lesao", columnDefinition = "TEXT")
    public String descricaoLesao;

    @Column(columnDefinition = "TEXT")
    public String diagnostico;

    @Column(length = 20)
    public String cid10;

    @Column(name = "cid11", length = 30)
    public String cid11;

    @Column(name = "numero_tratamentos_previsto")
    public Integer numeroTratamentosPrevisto;

    @Column(name = "medicamentos_em_uso", columnDefinition = "TEXT")
    public String medicamentosEmUso;

    @Column(columnDefinition = "TEXT")
    public String alergias;

    @Column(columnDefinition = "TEXT")
    public String vicios;

    @Column(length = 255)
    public String otoscopia;

    @Column(length = 255)
    public String proteses;

    @Column(length = 255)
    public String ventilacao;

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

    public static Patient findByRegistroOHB(String registroOHB) {
        return find("registroOHB = ?1 and deletedAt is null", registroOHB).firstResult();
    }

    public static Patient findByCpf(String cpf) {
        return find("cpf = ?1 and deletedAt is null", cpf).firstResult();
    }
}
