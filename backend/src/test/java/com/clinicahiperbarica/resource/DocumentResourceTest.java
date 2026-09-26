package com.clinicahiperbarica.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class DocumentResourceTest {

    private static String patientId;
    private static String registroOHB;
    private static String createdDocumentId;

    @Test
    @Order(1)
    public void testSetupPatient() {
        registroOHB = "OHB-DOC-" + System.currentTimeMillis();
        String patientPayload = String.format("""
            {
                "registroOHB": "%s",
                "nome": "Clarice de Teste",
                "cpf": "555.666.777-88"
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
    public void testCreateDocumentWithoutPatientFails() {
        String invalidPayload = """
            {
                "tipo": "foto_lesao",
                "titulo": "Foto Lesão Perna Esquerda"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidPayload)
            .when().post("/api/documents")
            .then()
                .statusCode(400);
    }

    @Test
    @Order(3)
    public void testCreateDocumentSuccess() {
        String docPayload = String.format("""
            {
                "patient": { "id": "%s" },
                "tipo": "foto_lesao",
                "titulo": "Foto Lesão Maleolar - Pré-Sessão",
                "tamanhoKb": 204,
                "s3Key": "prontuarios/%s/lesao_maleolo.jpg",
                "imageUrl": "https://clinica-ohb-prontuarios.s3.us-east-1.amazonaws.com/prontuarios/%s/lesao_maleolo.jpg",
                "observacoes": "Lesão com 4cm de diâmetro e bordas hiperemiadas"
            }
            """, patientId, registroOHB, registroOHB);

        createdDocumentId = given()
            .contentType(ContentType.JSON)
            .body(docPayload)
            .when().post("/api/documents")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("patientName", equalTo("Clarice de Teste"))
                .body("registroOHB", equalTo(registroOHB))
                .body("tipo", equalTo("foto_lesao"))
                .body("titulo", equalTo("Foto Lesão Maleolar - Pré-Sessão"))
                .extract().path("id");
    }

    @Test
    @Order(4)
    public void testGetDocumentById() {
        given()
            .pathParam("id", createdDocumentId)
            .when().get("/api/documents/{id}")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(createdDocumentId))
                .body("registroOHB", equalTo(registroOHB))
                .body("titulo", equalTo("Foto Lesão Maleolar - Pré-Sessão"));
    }

    @Test
    @Order(5)
    public void testListDocumentsByPatientId() {
        given()
            .queryParam("patientId", patientId)
            .when().get("/api/documents")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].patient.id", equalTo(patientId));
    }

    @Test
    @Order(6)
    public void testListDocumentsByRegistroOHB() {
        given()
            .queryParam("registroOHB", registroOHB)
            .when().get("/api/documents")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].registroOHB", equalTo(registroOHB));
    }

    @Test
    @Order(7)
    public void testDeleteDocumentSoftDelete() {
        given()
            .pathParam("id", createdDocumentId)
            .when().delete("/api/documents/{id}")
            .then()
                .statusCode(204);

        // Document should now return 404
        given()
            .pathParam("id", createdDocumentId)
            .when().get("/api/documents/{id}")
            .then()
                .statusCode(404);
    }
}
