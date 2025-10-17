package com.ra.base_spring_boot.services.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.ra.base_spring_boot.services.IEmailService;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.text.Normalizer;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;

@Service
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Normalize Vietnamese characters to decomposed form
    private String normalizeString(String input) {
        if (input == null) {
            return "N/A";
        }
        return Normalizer.normalize(input, Normalizer.Form.NFD);
    }

    // For reset password
    @Async
    @Override
    public void sendEmail(String to, String subject, String otpCode, String verifyLink) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email_otp_template.html");
            String htmlTemplate;
            try (InputStream inputStream = resource.getInputStream()) {
                htmlTemplate = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
            String content = htmlTemplate.replace("{OTP_CODE}", otpCode)
                    .replace("{VERIFY_LINK}", verifyLink);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom("Movie Ticket Booking <no-reply@movieticketbooking.com>");
            mailSender.send(mimeMessage);
        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Failed to send email to " + to + ": " + e.getMessage(), e);
        }
    }

    // For payment confirmation
    @Async
    @Override
    public void sendPaymentConfirmationEmail(String to, String subject, String transactionId, double amount,
                                             Date paymentTime, String movieTitle, List<String> seatNames,
                                             Date showtime, String paymentMethod, String theaterName, String screenName) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/payment_confirmation_template.html");
            String htmlTemplate;
            try (InputStream inputStream = resource.getInputStream()) {
                htmlTemplate = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }

            // Replace placeholders in the template
            String content = htmlTemplate
                    .replace("${transactionId}", transactionId != null ? transactionId : "N/A")
                    .replace("${amount}", String.format("%.2f", amount))
                    .replace("${paymentTime}", paymentTime != null ? new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(paymentTime) : "N/A")
                    .replace("${movieTitle}", movieTitle != null ? movieTitle : "N/A")
                    .replace("${theaterName}", theaterName != null ? theaterName : "N/A")
                    .replace("${screenName}", screenName != null ? screenName : "N/A")
                    .replace("${seatNames}", seatNames != null && !seatNames.isEmpty() ? String.join(", ", seatNames) : "N/A")
                    .replace("${showtime}", showtime != null ? new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(showtime) : "N/A")
                    .replace("${paymentMethod}", paymentMethod != null ? paymentMethod : "N/A");

            // Normalize and encode fields for QR code
            String normalizedMovieTitle = normalizeString(movieTitle);
            String normalizedTheaterName = normalizeString(theaterName);
            String normalizedScreenName = normalizeString(screenName);
            String normalizedPaymentMethod = normalizeString(paymentMethod);

            // Generate QR code content
            String qrContent = String.format(
                    "Mã giao dịch: %s\nSố tiền: %.2f VND\nThời gian thanh toán: %s\nTên phim: %s\nRạp: %s\nPhòng chiếu: %s\nGhế: %s\nSuất chiếu: %s\nPhương thức thanh toán: %s",
                    transactionId != null ? transactionId : "N/A",
                    amount,
                    paymentTime != null ? new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(paymentTime) : "N/A",
                    normalizedMovieTitle,
                    normalizedTheaterName,
                    normalizedScreenName,
                    seatNames != null && !seatNames.isEmpty() ? String.join(", ", seatNames) : "N/A",
                    showtime != null ? new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(showtime) : "N/A",
                    normalizedPaymentMethod
            );

            ByteArrayOutputStream qrOutputStream = new ByteArrayOutputStream();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 200, 200, hints);
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrOutputStream);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom("Movie Ticket Booking <no-reply@movieticketbooking.com>");
            helper.addInline("qrCode", new ByteArrayDataSource(qrOutputStream.toByteArray(), "image/png"));
            mailSender.send(mimeMessage);
        } catch (MessagingException | IOException | WriterException e) {
            throw new RuntimeException("Failed to send payment confirmation email to " + to + ": " + e.getMessage(), e);
        }
    }
}