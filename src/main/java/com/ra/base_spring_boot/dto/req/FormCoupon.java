package com.ra.base_spring_boot.dto.req;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FormCoupon {
    @NotBlank(message = "Name coupon cannot be empty")
    @Size(max = 255, message = "Name coupon cannot exceed 255 characters")
    @Schema(description = "Name of the coupon", example = "Voucher Giảm 50k", required = false)
    private String name;

    @NotBlank(message = "Code cannot be empty")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Schema(description = "Code of the coupon", example = "50KQUAGIANGSINH", required = false)
    private String code;

    @NotNull(message = "Value cannot be null")
    @Schema(description = "Value of the coupon", example = "50,000", required = false)
    private Long value;

    @NotNull(message = "Exchange point cannot be null")
    @Schema(description = "Exchange_point of the coupon", example = "100", required = false)
    private Long exchange_point;

}
