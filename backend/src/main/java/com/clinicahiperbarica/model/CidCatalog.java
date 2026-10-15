package com.clinicahiperbarica.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.panache.common.Page;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cid_catalog", indexes = {
    @Index(name = "idx_cid11", columnList = "codigo_cid11"),
    @Index(name = "idx_cid10", columnList = "codigo_cid10"),
    @Index(name = "idx_nome", columnList = "nome")
})
public class CidCatalog extends PanacheEntityBase {

    @Id
    @GeneratedValue
    public UUID id;

    @Column(name = "codigo_cid11", length = 30, nullable = false)
    public String codigoCid11;

    @Column(name = "codigo_cid10", length = 30)
    public String codigoCid10;

    @Column(length = 255, nullable = false)
    public String nome;

    @Column(length = 150)
    public String capitulo;

    @Column(columnDefinition = "TEXT")
    public String sinonimos;

    public CidCatalog() {}

    public CidCatalog(String codigoCid11, String codigoCid10, String nome, String capitulo, String sinonimos) {
        this.codigoCid11 = codigoCid11;
        this.codigoCid10 = codigoCid10;
        this.nome = nome;
        this.capitulo = capitulo;
        this.sinonimos = sinonimos;
    }

    public static String stripAccents(String s) {
        if (s == null) return "";
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase();
    }

    public static List<CidCatalog> search(String query, int limit) {
        int safeLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        if (query == null || query.trim().isEmpty()) {
            return findAll().page(Page.of(0, safeLimit)).list();
        }
        String raw = query.trim().toLowerCase();
        String unaccented = stripAccents(raw);
        String pattern1 = "%" + raw + "%";
        String pattern2 = "%" + unaccented + "%";
        return find(
            "lower(codigoCid11) like ?1 or lower(codigoCid10) like ?1 or lower(nome) like ?1 or lower(sinonimos) like ?1 or lower(sinonimos) like ?2 order by case when lower(codigoCid11) like ?1 or lower(codigoCid10) like ?1 then 0 else 1 end, nome asc",
            pattern1, pattern2
        ).page(Page.of(0, safeLimit)).list();
    }
}
