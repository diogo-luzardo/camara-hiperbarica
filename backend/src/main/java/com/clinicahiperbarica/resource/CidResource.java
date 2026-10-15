package com.clinicahiperbarica.resource;

import com.clinicahiperbarica.model.CidCatalog;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/cids")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CidResource {

    @GET
    public Response search(
        @QueryParam("q") @DefaultValue("") String query,
        @QueryParam("limit") @DefaultValue("15") int limit
    ) {
        List<CidCatalog> results = CidCatalog.search(query, limit);
        return Response.ok(results).build();
    }
}
