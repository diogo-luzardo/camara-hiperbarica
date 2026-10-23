package com.clinicahiperbarica.resource;

import com.clinicahiperbarica.dto.UploadRequest;
import com.clinicahiperbarica.dto.UploadResponse;
import com.clinicahiperbarica.model.DigitalizedDocument;
import com.clinicahiperbarica.model.HyperbaricSession;
import com.clinicahiperbarica.model.Patient;
import com.clinicahiperbarica.service.S3StorageService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/api/documents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentResource {

    @Inject
    S3StorageService s3StorageService;

    @GET
    public List<DigitalizedDocument> list(
        @QueryParam("patientId") UUID patientId,
        @QueryParam("sessionId") UUID sessionId,
        @QueryParam("registroOHB") String registroOHB
    ) {
        if (patientId != null) {
            return DigitalizedDocument.findByPatientId(patientId);
        }
        if (sessionId != null) {
            return DigitalizedDocument.findBySessionId(sessionId);
        }
        if (registroOHB != null && !registroOHB.trim().isEmpty()) {
            return DigitalizedDocument.findByRegistroOHB(registroOHB.trim());
        }
        return DigitalizedDocument.list("deletedAt is null order by dataUpload desc");
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        DigitalizedDocument document = DigitalizedDocument.findById(id);
        if (document == null || document.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(document).build();
    }

    /**
     * Passo 1 do upload: Tablet/Frontend solicita URL pré-assinada da AWS S3
     */
    @POST
    @Path("/presigned-upload-url")
    public Response getPresignedUploadUrl(UploadRequest request) {
        String registroOHB = "geral";
        if (request.patientId != null) {
            Patient patient = Patient.findById(request.patientId);
            if (patient != null) {
                registroOHB = patient.registroOHB;
            }
        }

        UploadResponse response = s3StorageService.generatePresignedUploadUrl(
            registroOHB,
            request.filename,
            request.contentType
        );
        return Response.ok(response).build();
    }

    /**
     * Passo 2 do upload: Após o envio direto ao S3, grava o registro no PostgreSQL
     */
    @POST
    @Transactional
    public Response create(DigitalizedDocument document) {
        if (document.patient != null && document.patient.id != null) {
            Patient patient = Patient.findById(document.patient.id);
            if (patient != null) {
                document.patient = patient;
                if (document.patientName == null || document.patientName.trim().isEmpty()) {
                    document.patientName = patient.nome;
                }
                if (document.registroOHB == null || document.registroOHB.trim().isEmpty()) {
                    document.registroOHB = patient.registroOHB;
                }
                if (document.cpf == null || document.cpf.trim().isEmpty()) {
                    document.cpf = patient.cpf;
                }
                if (document.nomeMae == null || document.nomeMae.trim().isEmpty()) {
                    document.nomeMae = patient.nomeMae;
                }
            }
        }

        // Para prontuários físicos de pacientes ainda não cadastrados, exige ao menos o nome do paciente
        if (document.patient == null && (document.patientName == null || document.patientName.trim().isEmpty())) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Nome do paciente ou vínculo a paciente existente é obrigatório")
                .build();
        }

        if (document.session != null && document.session.id != null) {
            HyperbaricSession session = HyperbaricSession.findById(document.session.id);
            document.session = session;
        }

        document.persist();
        return Response.status(Response.Status.CREATED).entity(document).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        DigitalizedDocument document = DigitalizedDocument.findById(id);
        if (document == null || document.deletedAt != null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        document.deletedAt = java.time.LocalDateTime.now();
        return Response.noContent().build();
    }
}
