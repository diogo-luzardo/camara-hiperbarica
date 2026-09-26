package com.clinicahiperbarica.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class PatientResourceTest {

    private static String createdPatientId;
    private static final String UNIQUE_OHB = "OHB-TEST-" + System.currentTimeMillis();
    private static final String UNIQUE_CPF = "123.456.789-" + (System.currentTimeMillis() % 100);

    @Test
    @Order(1)
    public void testListPatientsInitially() {
        given()
            .when().get("/api/patients")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON);
    }

    @Test
    @Order(2)
    public void testCreatePatientValidationFailsWhenMissingOHB() {
        String invalidPayload = """
            {
                "nome": "Paciente Sem Registro",
                "cpf": "000.000.000-00"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidPayload)
            .when().post("/api/patients")
            .then()
                .statusCode(400);
    }

    @Test
    @Order(3)
    public void testCreatePatientSuccess() {
        String payload = String.format("""
            {
                "registroOHB": "%s",
                "nome": "Maria de Fatima Teste",
                "cpf": "%s",
                "idade": 58,
                "sexo": "F",
                "convenio": "Unimed",
                "diagnostico": "Úlcera Venosa Crônica",
                "cid10": "I87.2",
                "numeroTratamentosPrevisto": 20,
                "celular": "(11) 98765-4321"
            }
            """, UNIQUE_OHB, UNIQUE_CPF);

        createdPatientId = given()
            .contentType(ContentType.JSON)
            .body(payload)
            .when().post("/api/patients")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("registroOHB", equalTo(UNIQUE_OHB))
                .body("nome", equalTo("Maria de Fatima Teste"))
                .body("convenio", equalTo("Unimed"))
                .extract().path("id");
    }

    @Test
    @Order(4)
    public void testGetPatientById() {
        given()
            .pathParam("id", createdPatientId)
            .when().get("/api/patients/{id}")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(createdPatientId))
                .body("registroOHB", equalTo(UNIQUE_OHB))
                .body("diagnostico", equalTo("Úlcera Venosa Crônica"));
    }

    @Test
    @Order(5)
    public void testGetPatientByRegistroOHB() {
        given()
            .pathParam("registroOHB", UNIQUE_OHB)
            .when().get("/api/patients/ohb/{registroOHB}")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(createdPatientId))
                .body("nome", equalTo("Maria de Fatima Teste"));
    }

    @Test
    @Order(6)
    public void testSearchPatientsByQuery() {
        given()
            .queryParam("search", "Maria de Fatima")
            .when().get("/api/patients")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1));
    }

    @Test
    @Order(7)
    public void testUpdatePatient() {
        String updatePayload = """
            {
                "nome": "Maria de Fatima Teste Atualizada",
                "convenio": "Bradesco Saúde",
                "numeroTratamentosPrevisto": 30
            }
            """;

        given()
            .pathParam("id", createdPatientId)
            .contentType(ContentType.JSON)
            .body(updatePayload)
            .when().put("/api/patients/{id}")
            .then()
                .statusCode(200)
                .body("nome", equalTo("Maria de Fatima Teste Atualizada"))
                .body("convenio", equalTo("Bradesco Saúde"))
                .body("numeroTratamentosPrevisto", equalTo(30));
    }

    @Test
    @Order(8)
    public void testDeletePatientSoftDelete() {
        given()
            .pathParam("id", createdPatientId)
            .when().delete("/api/patients/{id}")
            .then()
                .statusCode(204);

        // Confirm patient is no longer accessible via getById
        given()
            .pathParam("id", createdPatientId)
            .when().get("/api/patients/{id}")
            .then()
                .statusCode(404);
    }
}
