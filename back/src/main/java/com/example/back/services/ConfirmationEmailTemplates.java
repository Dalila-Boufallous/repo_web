package com.example.back.services;

public final class ConfirmationEmailTemplates {
    private ConfirmationEmailTemplates(){}

    public static String buildRdvConfirmationHtml(long rdvId,
                                                  String date,
                                                  String heure,
                                                  String commentaires,
                                                  String confirmationUrl) {
        String brand = "#6f42c1";
        String com = (commentaires == null) ? "" : commentaires;
        return "<!doctype html><html lang='fr'><head><meta charset='UTF-8'/>"
            + "<meta name='viewport' content='width=device-width,initial-scale=1'/>"
            + "<title>Confirmation de rendez-vous</title></head>"
            + "<body style='margin:0;padding:0;background:#f5f6fa;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#1f2937;'>"
            + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#f5f6fa;padding:24px 0;'>"
            + "<tr><td align='center'>"
            + "<table role='presentation' width='600' cellspacing='0' cellpadding='0' "
            + "style='max-width:600px;background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.06);overflow:hidden;border:1px solid #eceff5;'>"
            + "<tr><td style='background:" + brand + ";color:#fff;padding:18px 22px;font-weight:700;font-size:18px;'>"
            + "Confirmation de votre rendez-vous</td></tr>"
            + "<tr><td style='padding:20px 22px;font-size:15px;line-height:1.55;'>"
            + "<p>Bonjour,</p>"
            + "<p>Vous avez un rendez-vous <strong>non confirmé</strong> :</p>"
            + "<ul style='padding-left:18px;margin:10px 0;'>"
            + "<li><strong>Référence :</strong> #" + rdvId + "</li>"
            + "<li><strong>Date :</strong> " + (date == null ? "-" : date) + "</li>"
            + "<li><strong>Heure :</strong> " + (heure == null ? "-" : heure) + "</li>"
            + "</ul>"
            + "<p>Cliquez sur le bouton ci-dessous pour confirmer votre présence.</p>"
            + "<div style='text-align:center;margin:22px 0;'>"
            + "<a href='" + confirmationUrl + "' style='display:inline-block;background:" + brand + ";color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;'>"
            + "Confirmer le rendez-vous</a></div>"
            + "<p style='font-size:13px;color:#6b7280;'>Si le bouton ne fonctionne pas :<br>"
            + "<span style='word-break:break-all;color:" + brand + ";'>" + confirmationUrl + "</span></p>"
            + (com.isBlank() ? "" : "<p style='margin-top:12px;'><em>Note :</em> " + com + "</p>")
            + "<p style='margin-top:16px;'>Merci et à bientôt.</p>"
            + "</td></tr>"
            + "<tr><td style='background:#f9fafb;color:#6b7280;font-size:12px;padding:14px 22px;text-align:center;'>"
            + "Message automatique — ne pas répondre</td></tr>"
            + "</table></td></tr></table></body></html>";
    }
}
