package com.fishnote.image;

import com.cloudinary.Cloudinary;
import com.fishnote.image.dto.ImageUploadResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final String UPLOAD_FOLDER = "fishnote/reviews";
    private static final String UPLOAD_ERROR_MESSAGE = "이미지 업로드에 실패했습니다.";

    private final Cloudinary cloudinary;

    public ImageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public ImageUploadResponse upload(MultipartFile file) {
        byte[] bytes = validate(file);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    bytes,
                    Map.of(
                            "folder", UPLOAD_FOLDER,
                            "resource_type", "image",
                            // 폰 원본(수 MB)을 그대로 저장하지 않도록 업로드 시점에 축소
                            "transformation", "c_limit,w_1600,q_auto:good"));
            String url = uploadUrl(uploadResult);
            return new ImageUploadResponse(url);
        } catch (IOException ex) {
            throw new ImageUploadException(UPLOAD_ERROR_MESSAGE, ex);
        } catch (RuntimeException ex) {
            if (ex instanceof ImageUploadException imageUploadException) {
                throw imageUploadException;
            }
            throw new ImageUploadException(UPLOAD_ERROR_MESSAGE, ex);
        }
    }

    private byte[] validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일은 필수입니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("이미지는 5MB 이하만 업로드할 수 있습니다.");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType)
                || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new ImageUploadException(UPLOAD_ERROR_MESSAGE, ex);
        }
        // content-type 헤더는 클라이언트가 위조할 수 있으므로 매직 바이트로 실제 포맷 확인
        if (!isRealImage(bytes)) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
        return bytes;
    }

    private boolean isRealImage(byte[] b) {
        if (b.length < 12) {
            return false;
        }
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return true; // JPEG
        }
        if ((b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return true; // PNG
        }
        if (b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8') {
            return true; // GIF
        }
        if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return true; // WebP
        }
        if (b[4] == 'f' && b[5] == 't' && b[6] == 'y' && b[7] == 'p') {
            // HEIC/HEIF/AVIF (아이폰 사진 등)
            String brand = new String(b, 8, 4, StandardCharsets.US_ASCII).toLowerCase(Locale.ROOT);
            return Set.of("heic", "heix", "hevc", "heim", "heis", "mif1", "msf1", "avif", "avis").contains(brand);
        }
        return false;
    }

    private String uploadUrl(Map<?, ?> uploadResult) {
        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl instanceof String url && StringUtils.hasText(url)) {
            return url;
        }

        throw new ImageUploadException(UPLOAD_ERROR_MESSAGE);
    }
}
