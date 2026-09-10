package com.clinicahiperbarica.resource;

import com.clinicahiperbarica.model.HyperbaricSession;
import com.clinicahiperbarica.model.Patient;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Path("/api/sessions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HyperbaricSessionResource {

    @GET
    public List<HyperbaricSession> list(
        @QueryParam("patientId") UUID patientId,
        @QueryParam("registroOHB") String registroOHB,
        @QueryParam("data") String dataStr
    ) {
        if (patientId != null) {
            return HyperbaricSession.findByPatientId(patientId);
        }
        if (registroOHB != null && !registroOHB.trim().isEmpty()) {
            return HyperbaricSession.findByRegistroOHB(registroOHB.trim());
        }
        if (dataStr != null && !dataStr.trim().isEmpty()) {
            LocalDate date = LocalDate.parse(dataStr.trim());
            return HyperbaricSession.list("data = ?1 and deletedAt is null order by hora asc", date);
        }
        return HyperbaricSession.list("deletedAt is null order by data desc, sessionNumber desc");
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        HyperbaricSession session = HyperbaricSession.findById(id);
        if (session == null || session.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(session).build();
    }

    @POST
    @Transactional
    public Response create(HyperbaricSession session) {
        if (session.patient == null || session.patient.id == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Paciente é obrigatório")
                .build();
        }

        Patient patient = Patient.findById(session.patient.id);
        if (patient == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity("Paciente informado não encontrado")
                .build();
        }

        session.patient = patient;
        if (session.registroOHB == null || session.registroOHB.isEmpty()) {
            session.registroOHB = patient.registroOHB;
        }

        // Se o número da sessão não for informado, incrementa automaticamente a partir das sessões anteriores
        if (session.sessionNumber == null || session.sessionNumber <= 0) {
            long previousCount = HyperbaricSession.count("patient.id", patient.id);
            session.sessionNumber = (int) previousCount + 1;
        }

        if (session.data == null) {
            session.data = LocalDate.now();
        }

        session.persist();
        return Response.status(Response.Status.CREATED).entity(session).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, HyperbaricSession updatedData) {
        HyperbaricSession session = HyperbaricSession.findById(id);
        if (session == null || session.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Atualização dos parâmetros clínicos e checagens (preenchido no tablet pela enfermeira)
        session.ata = updatedData.ata;
        session.pa = updatedData.pa;
        session.glicemia = updatedData.glicemia;
        session.temperatura = updatedData.temperatura;
        session.duracaoMinutos = updatedData.duracaoMinutos;
        session.tratamentoMedicacao = updatedData.tratamentoMedicacao;
        session.intercorrencias = updatedData.intercorrencias;
        session.medicoResponsavel = updatedData.medicoResponsavel;
        session.enfermeiroResponsavel = updatedData.enfermeiroResponsavel;
        session.tecnicoResponsavel = updatedData.tecnicoResponsavel;

        // Checagens de segurança
        session.conferenciaNome = updatedData.conferenciaNome;
        session.roupaAlgodao = updatedData.roupaAlgodao;
        session.pulseiraEstatica = updatedData.pulseiraEstatica;
        session.removerMetaisEletronicos = updatedData.removerMetaisEletronicos;
        session.retirarProteses = updatedData.retirarProteses;
        session.sondaVesicalAberta = updatedData.sondaVesicalAberta;
        session.avpAvcPicc = updatedData.avpAvcPicc;
        session.velocidadeCompressao = updatedData.velocidadeCompressao;
        session.velocidadeDescompressao = updatedData.velocidadeDescompressao;
        session.covidFebreTosse = updatedData.covidFebreTosse;

        // Diagnósticos de enfermagem
        session.diagDor = updatedData.diagDor;
        session.diagQueda = updatedData.diagQueda;
        session.diagDeambulacao = updatedData.diagDeambulacao;
        session.diagGlicemia = updatedData.diagGlicemia;
        session.diagPele = updatedData.diagPele;
        session.diagContaminacao = updatedData.diagContaminacao;
        session.diagAnsiedade = updatedData.diagAnsiedade;

        session.evolucaoEnfermagem = updatedData.evolucaoEnfermagem;
        session.status = updatedData.status;

        return Response.ok(session).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        HyperbaricSession session = HyperbaricSession.findById(id);
        if (session == null || session.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        session.deletedAt = java.time.LocalDateTime.now();
        return Response.noContent().build();
    }
}
