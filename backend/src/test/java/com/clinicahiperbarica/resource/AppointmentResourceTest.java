package com.clinicahiperbarica.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AppointmentResourceTest {

    private static String patientId;
    private static String registroOHB;
    private static String createdAppointmentId;
    private static final String appointmentDate = LocalDate.now().plusDays(2).toString();

    @Test
    @Order(1)
    public void testSetupPatient() {
        registroOHB = "OHB-APPT-" + System.currentTimeMillis();
        String patientPayload = String.format("""
            {
                "registroOHB": "%s",
                "nome": "Sebastiao de Teste",
                "cpf": "111.222.333-44",
                "celular": "(11) 99887-7665"
            }
            """, registroOHB);

        patientId = given()
            .contentType(ContentType.JSON)
            .body(patientPayload)
            .when().post("/api/patients")
            .then()
                .statusCode(201)
                .extract().path("id");
    }

    @Test
    @Order(2)
    public void testCreateAppointmentMissingPatientFails() {
        String invalidPayload = """
            {
                "data": "2026-10-01",
                "horario": "10:00"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidPayload)
            .when().post("/api/appointments")
            .then()
                .statusCode(400);
    }

    @Test
    @Order(3)
    public void testCreateAppointmentSuccess() {
        String payload = String.format("""
            {
                "patient": { "id": "%s" },
                "data": "%s",
                "horario": "10:30",
                "diaSemana": "Terça-feira",
                "sessaoNumero": 5,
                "pressaoATA": 2.0,
                "status": "agendado",
                "observacoes": "Trazer curativos adicionais"
            }
            """, patientId, appointmentDate);

        createdAppointmentId = given()
            .contentType(ContentType.JSON)
            .body(payload)
            .when().post("/api/appointments")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("patientName", equalTo("Sebastiao de Teste"))
                .body("registroOHB", equalTo(registroOHB))
                .body("horario", equalTo("10:30"))
                .body("sessaoNumero", equalTo(5))
                .body("status", equalTo("agendado"))
                .extract().path("id");
    }

    @Test
    @Order(4)
    public void testGetAppointmentById() {
        given()
            .pathParam("id", createdAppointmentId)
            .when().get("/api/appointments/{id}")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(createdAppointmentId))
                .body("horario", equalTo("10:30"))
                .body("observacoes", equalTo("Trazer curativos adicionais"));
    }

    @Test
    @Order(5)
    public void testListAppointmentsByDate() {
        given()
            .queryParam("data", appointmentDate)
            .when().get("/api/appointments")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].patientName", equalTo("Sebastiao de Teste"));
    }

    @Test
    @Order(6)
    public void testListAppointmentsByPatientId() {
        given()
            .queryParam("patientId", patientId)
            .when().get("/api/appointments")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].patient.id", equalTo(patientId));
    }

    @Test
    @Order(7)
    public void testUpdateAppointmentStatus() {
        String updatePayload = String.format("""
            {
                "data": "%s",
                "horario": "10:30",
                "diaSemana": "Terça-feira",
                "sessaoNumero": 5,
                "pressaoATA": 2.0,
                "status": "concluido",
                "observacoes": "Compareceu pontualmente. Sessão realizada."
            }
            """, appointmentDate);

        given()
            .pathParam("id", createdAppointmentId)
            .contentType(ContentType.JSON)
            .body(updatePayload)
            .when().put("/api/appointments/{id}")
            .then()
                .statusCode(200)
                .body("status", equalTo("concluido"))
                .body("observacoes", containsString("Compareceu pontualmente"));
    }

    @Test
    @Order(8)
    public void testDeleteAppointmentSoftDelete() {
        given()
            .pathParam("id", createdAppointmentId)
            .when().delete("/api/appointments/{id}")
            .then()
                .statusCode(204);

        // Appointment should now return 404
        given()
            .pathParam("id", createdAppointmentId)
            .when().get("/api/appointments/{id}")
            .then()
                .statusCode(404);
    }
}
