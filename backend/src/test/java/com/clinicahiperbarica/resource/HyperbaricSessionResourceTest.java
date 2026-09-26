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
public class HyperbaricSessionResourceTest {

    private static String patientId;
    private static String registroOHB;
    private static String createdSessionId;

    @Test
    @Order(1)
    public void testSetupPatient() {
        registroOHB = "OHB-SESS-" + System.currentTimeMillis();
        String patientPayload = String.format("""
            {
                "registroOHB": "%s",
                "nome": "Carlos Drummond de Teste",
                "cpf": "999.888.777-66"
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
    public void testCreateSessionWithoutPatientFails() {
        String invalidPayload = """
            {
                "ata": 2.4,
                "duracaoMinutos": 90
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidPayload)
            .when().post("/api/sessions")
            .then()
                .statusCode(400);
    }

    @Test
    @Order(3)
    public void testCreateSessionSuccess() {
        String today = LocalDate.now().toString();
        String sessionPayload = String.format("""
            {
                "patient": { "id": "%s" },
                "registroOHB": "%s",
                "sessionNumber": 1,
                "data": "%s",
                "hora": "09:00",
                "ata": 2.4,
                "duracaoMinutos": 90,
                "pa": "120x80",
                "glicemia": "105",
                "temperatura": "36.4",
                "status": "em_andamento",
                "medicoResponsavel": "Dr. Fernando Hiperbárico",
                "enfermeiroResponsavel": "Enf. Roberta Lima",
                "conferenciaNome": true,
                "roupaAlgodao": true,
                "pulseiraEstatica": true,
                "removerMetaisEletronicos": true,
                "diagPele": "PR",
                "diagDor": "A"
            }
            """, patientId, registroOHB, today);

        createdSessionId = given()
            .contentType(ContentType.JSON)
            .body(sessionPayload)
            .when().post("/api/sessions")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("sessionNumber", equalTo(1))
                .body("pa", equalTo("120x80"))
                .body("roupaAlgodao", equalTo(true))
                .extract().path("id");
    }

    @Test
    @Order(4)
    public void testGetSessionById() {
        given()
            .pathParam("id", createdSessionId)
            .when().get("/api/sessions/{id}")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(createdSessionId))
                .body("registroOHB", equalTo(registroOHB))
                .body("status", equalTo("em_andamento"));
    }

    @Test
    @Order(5)
    public void testListSessionsByPatientId() {
        given()
            .queryParam("patientId", patientId)
            .when().get("/api/sessions")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].patient.id", equalTo(patientId));
    }

    @Test
    @Order(6)
    public void testListSessionsByRegistroOHB() {
        given()
            .queryParam("registroOHB", registroOHB)
            .when().get("/api/sessions")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].registroOHB", equalTo(registroOHB));
    }

    @Test
    @Order(7)
    public void testUpdateSessionClinicalEvolution() {
        String updatePayload = """
            {
                "pa": "125x82",
                "glicemia": "98",
                "duracaoMinutos": 90,
                "status": "finalizado",
                "evolucaoEnfermagem": "Sessão concluída sem queixas óticas ou barotrauma. Curativo mantido limpo e seco.",
                "conferenciaNome": true,
                "roupaAlgodao": true
            }
            """;

        given()
            .pathParam("id", createdSessionId)
            .contentType(ContentType.JSON)
            .body(updatePayload)
            .when().put("/api/sessions/{id}")
            .then()
                .statusCode(200)
                .body("status", equalTo("finalizado"))
                .body("pa", equalTo("125x82"))
                .body("evolucaoEnfermagem", containsString("Sessão concluída"));
    }

    @Test
    @Order(8)
    public void testDeleteSessionSoftDelete() {
        given()
            .pathParam("id", createdSessionId)
            .when().delete("/api/sessions/{id}")
            .then()
                .statusCode(204);

        // Session should now return 404
        given()
            .pathParam("id", createdSessionId)
            .when().get("/api/sessions/{id}")
            .then()
                .statusCode(404);
    }
}
