package com.example.back.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConfirmationTokenService {
    private static final Logger log = LoggerFactory.getLogger(ConfirmationTokenService.class);
    private static final String HMAC_ALGO = "HmacSHA256";

    private final String secret;      // clé de signature
    private final long ttlSeconds;    // durée de validité des tokens

    public ConfirmationTokenService(Environment env) {
        // On NE TOUCHE PAS au application.properties.
        // Si app.confirm.secret n’est pas fourni (env var / -D), on génère un secret éphémère (dev-only).
        this.secret = Optional.ofNullable(env.getProperty("app.confirm.secret"))
                .filter(s -> !s.isBlank())
                .orElseGet(() -> {
                    String gen = Base64.getUrlEncoder().withoutPadding()
                            .encodeToString(("dev-" + UUID.randomUUID()).getBytes(StandardCharsets.UTF_8));
                    log.warn("app.confirm.secret manquant → secret DEV éphémère généré. " +
                             "Définis app.confirm.secret en prod (env var APP_CONFIRM_SECRET ou -Dapp.confirm.secret).");
                    return gen;
                });

        // TTL configurable via env var APP_CONFIRM_TTL_SECONDS ou -Dapp.confirm.ttl-seconds (défaut 48h)
        this.ttlSeconds = Long.parseLong(env.getProperty("app.confirm.ttl-seconds", "172800"));
        log.debug("ConfirmationTokenService prêt (ttl={}s)", this.ttlSeconds);
    }

    /** Crée un token signé pour (rdvId, patientId). Format: base64url(payload).base64url(hmac) */
    public String generate(long rdvId, long patientId) {
        long now = Instant.now().getEpochSecond();
        long exp = now + ttlSeconds;

        // payload très simple (pas de JSON, pas de DTO) : "rdvId:patientId:exp"
        String payload = rdvId + ":" + patientId + ":" + exp;
        String payloadB64 = base64Url(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(payloadB64);

        return payloadB64 + "." + signature;
    }

    /**
     * Vérifie la signature + l’expiration et renvoie les "claims" sous forme de Map:
     *   rdvId, patientId, exp
     * -> Pas de DTO.
     * Lance IllegalArgumentException si invalide/expiré.
     */
    public Map<String, Long> verify(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token vide");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Format token invalide");
        }

        String payloadB64 = parts[0];
        String givenSig   = parts[1];
        String expectedSig = sign(payloadB64);

        // comparaison temps-constant
        if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.US_ASCII),
                                   givenSig.getBytes(StandardCharsets.US_ASCII))) {
            throw new IllegalArgumentException("Signature invalide");
        }

        String payload = new String(Base64.getUrlDecoder().decode(payloadB64), StandardCharsets.UTF_8);
        String[] p = payload.split(":");
        if (p.length != 3) {
            throw new IllegalArgumentException("Payload invalide");
        }

        long rdvId     = parseLongStrict(p[0], "rdvId");
        long patientId = parseLongStrict(p[1], "patientId");
        long exp       = parseLongStrict(p[2], "exp");

        long now = Instant.now().getEpochSecond();
        if (now > exp) {
            throw new IllegalArgumentException("Token expiré");
        }

        Map<String, Long> claims = new HashMap<>();
        claims.put("rdvId", rdvId);
        claims.put("patientId", patientId);
        claims.put("exp", exp);
        return claims;
    }

    /** Optionnel : simple check booléen si tu en as besoin quelque part. */
    public boolean isValid(String token) {
        try {
            verify(token);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    // -------------------- Helpers --------------------

    private String sign(String payloadB64) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGO));
            byte[] sig = mac.doFinal(payloadB64.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(sig);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Erreur HMAC", e);
        }
    }

    private static String base64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private static long parseLongStrict(String s, String field) {
        try {
            return Long.parseLong(s);
        } catch (NumberFormatException nfe) {
            throw new IllegalArgumentException("Champ " + field + " invalide");
        }
    }
}
