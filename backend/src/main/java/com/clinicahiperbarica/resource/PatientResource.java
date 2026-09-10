package com.clinicahiperbarica.resource;

import com.clinicahiperbarica.model.Patient;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/api/patients")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PatientResource {

    @GET
    public List<Patient> listAll(@QueryParam("search") String search) {
        if (search != null && !search.trim().isEmpty()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            return Patient.list(
                "deletedAt is null and (lower(nome) like ?1 or lower(registroOHB) like ?1 or lower(cpf) like ?1) order by nome asc",
                pattern
            );
        }
        return Patient.list("deletedAt is null order by nome asc");
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        Patient patient = Patient.findById(id);
        if (patient == null || patient.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(patient).build();
    }

    @GET
    @Path("/ohb/{registroOHB}")
    public Response getByRegistroOHB(@PathParam("registroOHB") String registroOHB) {
        Patient patient = Patient.findByRegistroOHB(registroOHB);
        if (patient == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(patient).build();
    }

    @POST
    @Transactional
    public Response create(Patient patient) {
        if (patient.registroOHB == null || patient.registroOHB.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Registro OHB é obrigatório")
                .build();
        }

        Patient existing = null;

        // 1. Verificar unicidade por ID (se informado)
        if (patient.id != null) {
            existing = Patient.findById(patient.id);
        }

        // 2. Verificar unicidade por Registro OHB
        if (existing == null) {
            existing = Patient.find("registroOHB", patient.registroOHB.trim()).firstResult();
        }

        // 3. Verificar unicidade por CPF (se informado)
        if (existing == null && patient.cpf != null && !patient.cpf.trim().isEmpty()) {
            existing = Patient.find("cpf", patient.cpf.trim()).firstResult();
        }

        if (existing != null) {
            // Se o paciente já existe (mesmo ID, CPF ou OHB), atualiza e reativa o cadastro
            copyFields(existing, patient);
            existing.deletedAt = null; // Reativa cadastro caso estivesse excluído logicamente
            return Response.ok(existing).build();
        }

        patient.persist();
        return Response.status(Response.Status.CREATED).entity(patient).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, Patient updatedData) {
        Patient patient = Patient.findById(id);
        if (patient == null || patient.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        copyFields(patient, updatedData);
        return Response.ok(patient).build();
    }

    private void copyFields(Patient target, Patient source) {
        if (source.registroOHB != null && !source.registroOHB.trim().isEmpty()) {
            target.registroOHB = source.registroOHB;
        }
        if (source.registroHospitalar != null) target.registroHospitalar = source.registroHospitalar;
        if (source.unidade != null) target.unidade = source.unidade;
        if (source.nome != null) target.nome = source.nome;
        if (source.convenio != null) target.convenio = source.convenio;
        if (source.plano != null) target.plano = source.plano;
        if (source.matriculaConvenio != null) target.matriculaConvenio = source.matriculaConvenio;
        if (source.validadeConvenio != null) target.validadeConvenio = source.validadeConvenio;
        if (source.dataNascimento != null) target.dataNascimento = source.dataNascimento;
        if (source.idade != null) target.idade = source.idade;
        if (source.sexo != null) target.sexo = source.sexo;
        if (source.estadoCivil != null) target.estadoCivil = source.estadoCivil;
        if (source.rg != null) target.rg = source.rg;
        if (source.cpf != null) target.cpf = source.cpf;
        if (source.profissao != null) target.profissao = source.profissao;
        if (source.nomeMae != null) target.nomeMae = source.nomeMae;
        if (source.cep != null) target.cep = source.cep;
        if (source.endereco != null) target.endereco = source.endereco;
        if (source.numero != null) target.numero = source.numero;
        if (source.complemento != null) target.complemento = source.complemento;
        if (source.bairro != null) target.bairro = source.bairro;
        if (source.municipio != null) target.municipio = source.municipio;
        if (source.uf != null) target.uf = source.uf;
        if (source.telefonesFixos != null) target.telefonesFixos = source.telefonesFixos;
        if (source.celular != null) target.celular = source.celular;
        if (source.email != null) target.email = source.email;
        if (source.procedencia != null) target.procedencia = source.procedencia;
        if (source.remocao != null) target.remocao = source.remocao;
        if (source.medicoIndicou != null) target.medicoIndicou = source.medicoIndicou;
        if (source.acompanhante != null) target.acompanhante = source.acompanhante;
        if (source.historiaClinica != null) target.historiaClinica = source.historiaClinica;
        if (source.exameFisicoResumido != null) target.exameFisicoResumido = source.exameFisicoResumido;
        if (source.localCurativos != null) target.localCurativos = source.localCurativos;
        if (source.avaliacaoDor != null) target.avaliacaoDor = source.avaliacaoDor;
        if (source.grauEntendimento != null) target.grauEntendimento = source.grauEntendimento;
        if (source.tempoExistenciaPatologia != null) target.tempoExistenciaPatologia = source.tempoExistenciaPatologia;
        if (source.descricaoLesao != null) target.descricaoLesao = source.descricaoLesao;
        if (source.diagnostico != null) target.diagnostico = source.diagnostico;
        if (source.cid10 != null) target.cid10 = source.cid10;
        if (source.numeroTratamentosPrevisto != null) target.numeroTratamentosPrevisto = source.numeroTratamentosPrevisto;
        if (source.medicamentosEmUso != null) target.medicamentosEmUso = source.medicamentosEmUso;
        if (source.alergias != null) target.alergias = source.alergias;
        if (source.vicios != null) target.vicios = source.vicios;
        if (source.otoscopia != null) target.otoscopia = source.otoscopia;
        if (source.proteses != null) target.proteses = source.proteses;
        if (source.ventilacao != null) target.ventilacao = source.ventilacao;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        Patient patient = Patient.findById(id);
        if (patient == null || patient.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        patient.deletedAt = java.time.LocalDateTime.now();
        return Response.noContent().build();
    }
}
