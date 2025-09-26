package com.example.back.services;

import jakarta.mail.MessagingException; // <-- important
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:no-reply@localhost}")
    private String defaultFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Envoi simple d'un email HTML (rappel RDV). */
    public String sendRappel(String to, String subject, String htmlBody) {
        return sendHtml(to, subject, htmlBody, null, null, null);
    }

    /** Envoi d'un email texte brut. */
    public String sendText(String to, String subject, String textBody) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(defaultFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, false);

            mailSender.send(mime);
            String id = mime.getMessageID();
            log.debug("Email texte envoyé à {} (messageId={})", to, id);
            return id;
        } catch (MailException | MessagingException e) {
            log.error("Échec envoi email texte à {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec envoi email texte", e);
        }
    }

    /** Envoi d'un email HTML avec options. */
    public String sendHtml(String to,
                           String subject,
                           String htmlBody,
                           String replyTo,
                           String[] cc,
                           String[] bcc) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(
                    mime,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );
            helper.setFrom(defaultFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);
            if (cc != null && cc.length > 0)           helper.setCc(cc);
            if (bcc != null && bcc.length > 0)         helper.setBcc(bcc);

            mailSender.send(mime);
            String id = mime.getMessageID();
            log.debug("Email HTML envoyé à {} (messageId={})", to, id);
            return id;
        } catch (MailException | MessagingException e) {
            log.error("Échec envoi email HTML à {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec envoi email HTML", e);
        }
    }

    /** Envoi d'un email HTML avec pièce jointe. */
    public String sendHtmlWithAttachment(String to,
                                         String subject,
                                         String htmlBody,
                                         String fileName,
                                         byte[] content,
                                         String contentType) {
        try {
            var mime = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mime, true, StandardCharsets.UTF_8.name());
            helper.setFrom(defaultFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            InputStreamSource source = new ByteArrayResource(content);
            helper.addAttachment(fileName, source, contentType);

            mailSender.send(mime);
            String id = mime.getMessageID();
            log.debug("Email HTML + PJ envoyé à {} (messageId={}, pj={})", to, id, fileName);
            return id;
        } catch (MailException | MessagingException e) {
            log.error("Échec envoi email HTML + PJ à {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Échec envoi email HTML avec pièce jointe", e);
        }
    }
}
