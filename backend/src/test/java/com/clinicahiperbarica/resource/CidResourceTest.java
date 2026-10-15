package com.clinicahiperbarica.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
public class CidResourceTest {

    @Test
    public void testSearchAllCidsReturnsResults() {
        given()
            .when().get("/api/cids")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", greaterThanOrEqualTo(5));
    }

    @Test
    public void testSearchCidByDescription() {
        given()
            .queryParam("q", "diabete")
            .when().get("/api/cids")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("codigoCid11", hasItem("5A14"))
                .body("codigoCid10", hasItem("E11.5"));
    }

    @Test
    public void testSearchCidByCid11Code() {
        given()
            .queryParam("q", "1B74")
            .when().get("/api/cids")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("[0].nome", containsString("Fascite necrotizante"));
    }

    @Test
    public void testSearchCidByCid10Code() {
        given()
            .queryParam("q", "M86.9")
            .when().get("/api/cids")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("[0].codigoCid11", equalTo("FB84.1"))
                .body("[0].nome", containsString("Osteomielite crônica"));
    }
}
