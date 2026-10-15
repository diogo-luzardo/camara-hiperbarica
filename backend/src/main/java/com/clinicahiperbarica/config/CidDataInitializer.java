package com.clinicahiperbarica.config;

import com.clinicahiperbarica.model.CidCatalog;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.io.InputStream;
import java.util.List;

@ApplicationScoped
public class CidDataInitializer {

    private static final Logger LOG = Logger.getLogger(CidDataInitializer.class);

    @Inject
    ObjectMapper objectMapper;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        try {
            long existingCount = CidCatalog.count();
            if (existingCount == 0) {
                LOG.info("Iniciando carga automática do catálogo de doenças (CID-11 / CID-10)...");
                try (InputStream is = getClass().getResourceAsStream("/cid11_dataset.json")) {
                    if (is != null) {
                        List<CidCatalog> entries = objectMapper.readValue(is, new TypeReference<List<CidCatalog>>() {});
                        for (CidCatalog entry : entries) {
                            String extra = CidCatalog.stripAccents(entry.nome + " " + (entry.sinonimos != null ? entry.sinonimos : ""));
                            entry.sinonimos = (entry.sinonimos != null ? entry.sinonimos + " | " : "") + extra;
                        }
                        CidCatalog.persist(entries);
                        LOG.infof("✅ Catálogo de doenças inicializado com sucesso! %d patologias CID-11/CID-10 carregadas no banco.", entries.size());
                    } else {
                        LOG.warn("Arquivo /cid11_dataset.json não foi encontrado nos recursos do backend.");
                    }
                }
            } else {
                List<CidCatalog> existing = CidCatalog.listAll();
                int updated = 0;
                for (CidCatalog c : existing) {
                    if (c.sinonimos == null || !c.sinonimos.contains(" | ")) {
                        String extra = CidCatalog.stripAccents(c.nome + " " + (c.sinonimos != null ? c.sinonimos : ""));
                        c.sinonimos = (c.sinonimos != null ? c.sinonimos + " | " : "") + extra;
                        c.persist();
                        updated++;
                    }
                }
                if (updated > 0) {
                    LOG.infof("✅ %d patologias do catálogo atualizadas com tokens de busca sem acento.", updated);
                } else {
                    LOG.infof("Catálogo de doenças já contém %d patologias carregadas e indexadas.", existingCount);
                }
            }
        } catch (Exception e) {
            LOG.errorf("Falha ao inicializar catálogo CID-11: %s", e.getMessage(), e);
        }
    }
}
