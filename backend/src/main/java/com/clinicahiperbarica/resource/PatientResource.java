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
                "lower(nome) like ?1 or lower(registroOHB) like ?1 or lower(cpf) like ?1 order by nome asc",
                pattern
            );
        }
        return Patient.list("order by nome asc");
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        Patient patient = Patient.findById(id);
        if (patient == null) {
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
        patient.persist();
        return Response.status(Response.Status.CREATED).entity(patient).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, Patient updatedData) {
        Patient patient = Patient.findById(id);
        if (patient == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Atualização dos campos cadastrais e clínicos
        patient.registroHospitalar = updatedData.registroHospitalar;
        patient.unidade = updatedData.unidade;
        patient.nome = updatedData.nome;
        patient.convenio = updatedData.convenio;
        patient.plano = updatedData.plano;
        patient.matriculaConvenio = updatedData.matriculaConvenio;
        patient.validadeConvenio = updatedData.validadeConvenio;
        patient.dataNascimento = updatedData.dataNascimento;
        patient.idade = updatedData.idade;
        patient.sexo = updatedData.sexo;
        patient.estadoCivil = updatedData.estadoCivil;
        patient.rg = updatedData.rg;
        patient.cpf = updatedData.cpf;
        patient.profissao = updatedData.profissao;
        patient.nomeMae = updatedData.nomeMae;
        patient.cep = updatedData.cep;
        patient.endereco = updatedData.endereco;
        patient.numero = updatedData.numero;
        patient.complemento = updatedData.complemento;
        patient.bairro = updatedData.bairro;
        patient.municipio = updatedData.municipio;
        patient.uf = updatedData.uf;
        patient.telefonesFixos = updatedData.telefonesFixos;
        patient.celular = updatedData.celular;
        patient.email = updatedData.email;
        patient.procedencia = updatedData.procedencia;
        patient.remocao = updatedData.remocao;
        patient.medicoIndicou = updatedData.medicoIndicou;
        patient.acompanhante = updatedData.acompanhante;
        patient.historiaClinica = updatedData.historiaClinica;
        patient.exameFisicoResumido = updatedData.exameFisicoResumido;
        patient.localCurativos = updatedData.localCurativos;
        patient.avaliacaoDor = updatedData.avaliacaoDor;
        patient.grauEntendimento = updatedData.grauEntendimento;
        patient.tempoExistenciaPatologia = updatedData.tempoExistenciaPatologia;
        patient.descricaoLesao = updatedData.descricaoLesao;
        patient.diagnostico = updatedData.diagnostico;
        patient.cid10 = updatedData.cid10;
        patient.numeroTratamentosPrevisto = updatedData.numeroTratamentosPrevisto;
        patient.medicamentosEmUso = updatedData.medicamentosEmUso;
        patient.alergias = updatedData.alergias;
        patient.vicios = updatedData.vicios;
        patient.otoscopia = updatedData.otoscopia;
        patient.proteses = updatedData.proteses;
        patient.ventilacao = updatedData.ventilacao;

        return Response.ok(patient).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        boolean deleted = Patient.deleteById(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}
