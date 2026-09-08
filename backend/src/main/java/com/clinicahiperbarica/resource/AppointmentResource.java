package com.clinicahiperbarica.resource;

import com.clinicahiperbarica.model.Appointment;
import com.clinicahiperbarica.model.Patient;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Path("/api/appointments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AppointmentResource {

    @GET
    public List<Appointment> list(
        @QueryParam("data") String dataStr,
        @QueryParam("patientId") UUID patientId
    ) {
        if (dataStr != null && !dataStr.trim().isEmpty()) {
            LocalDate date = LocalDate.parse(dataStr.trim());
            return Appointment.findByDate(date);
        }
        if (patientId != null) {
            return Appointment.findByPatientId(patientId);
        }
        return Appointment.list("order by data asc, horario asc");
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") UUID id) {
        Appointment appointment = Appointment.findById(id);
        if (appointment == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(appointment).build();
    }

    @POST
    @Transactional
    public Response create(Appointment appointment) {
        if (appointment.patient == null || appointment.patient.id == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Paciente é obrigatório")
                .build();
        }

        Patient patient = Patient.findById(appointment.patient.id);
        if (patient == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity("Paciente informado não encontrado")
                .build();
        }

        appointment.patient = patient;
        appointment.patientName = patient.nome;
        appointment.registroOHB = patient.registroOHB;
        appointment.cpf = patient.cpf;
        appointment.telefonePaciente = patient.celular != null ? patient.celular : patient.telefonesFixos;

        if (appointment.status == null || appointment.status.isEmpty()) {
            appointment.status = "agendado";
        }

        appointment.persist();
        return Response.status(Response.Status.CREATED).entity(appointment).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") UUID id, Appointment updatedData) {
        Appointment appointment = Appointment.findById(id);
        if (appointment == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        appointment.data = updatedData.data;
        appointment.horario = updatedData.horario;
        appointment.diaSemana = updatedData.diaSemana;
        appointment.sessaoNumero = updatedData.sessaoNumero;
        appointment.pressaoATA = updatedData.pressaoATA;
        appointment.status = updatedData.status;
        appointment.observacoes = updatedData.observacoes;

        return Response.ok(appointment).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") UUID id) {
        boolean deleted = Appointment.deleteById(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.noContent().build();
    }
}
