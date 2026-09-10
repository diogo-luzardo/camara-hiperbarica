package com.clinicahiperbarica.config;

import io.quarkus.runtime.LaunchMode;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.h2.tools.Server;
import org.jboss.logging.Logger;

import java.sql.SQLException;

@ApplicationScoped
public class H2ConsoleInitializer {

    private static final Logger LOG = Logger.getLogger(H2ConsoleInitializer.class);
    private Server webServer;

    void onStart(@Observes StartupEvent ev) {
        if (LaunchMode.current() == LaunchMode.DEVELOPMENT) {
            try {
                webServer = Server.createWebServer("-web", "-webAllowOthers", "-webPort", "8082").start();
                LOG.infof("✅ H2 Web Console iniciado com sucesso! Acesse no navegador: http://localhost:8082");
            } catch (SQLException e) {
                LOG.warnf("H2 Web Console já está em execução ou não pode ser iniciado na porta 8082: %s", e.getMessage());
            }
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        if (webServer != null && webServer.isRunning(false)) {
            webServer.stop();
            LOG.info("H2 Web Console finalizado.");
        }
    }
}
