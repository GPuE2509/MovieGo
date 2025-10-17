package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormAvatar;
import com.ra.base_spring_boot.dto.req.FormChangePassword;
import com.ra.base_spring_boot.dto.req.FormUpdateProfile;
import com.ra.base_spring_boot.dto.resp.AvatarResponse;
import com.ra.base_spring_boot.dto.resp.ProfileResponse;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.services.IManageUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Profile API", description = "APIs for managing feature of Profile page")
@Validated
public class ProfileController {

    @Autowired
    private final IManageUserService manageUserService;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Operation(summary = "Get profile user", description = "Retrieve profile user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @GetMapping("user/get-profile-user/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> getProfileUser(@PathVariable Long id) {
        User user = manageUserService.getUserById(id);
        ProfileResponse profileResponse = ProfileResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<ProfileResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(profileResponse)
                        .build()
        );
    }

    @Operation(summary = "Put profile user", description = "Update profile user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
    })
    @PutMapping("user/update-profile-user/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> getUpdateProfileUser(@PathVariable Long id, @ModelAttribute FormUpdateProfile formUpdateProfile) {
        manageUserService.updateUserById(id, formUpdateProfile);
        User user = manageUserService.getUserById(id);
        ProfileResponse profileResponse = ProfileResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<ProfileResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(profileResponse)
                        .build()
        );
    }
    @PutMapping("user/update-avatar-user/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> getUpdateAvatarUser(@PathVariable Long id, @ModelAttribute FormAvatar avatar) {
        manageUserService.updateAvatarUser(id, avatar);
        User user = manageUserService.getUserById(id);
        AvatarResponse avatarResponse = AvatarResponse.builder()
                .avatar(user.getAvatar())
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.<AvatarResponse>builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(avatarResponse)
                        .build()
        );
    }

    @Operation(summary = "Change user password", description = "Change password for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password changed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResponseWrapper.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or password mismatch",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "Old password is incorrect",
                    content = @Content(mediaType = "application/json"))
    })
    @PutMapping("user/change-password/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @Valid @RequestBody FormChangePassword formChangePassword) {
        User user = manageUserService.getUserById(id);

        // Verify old password
        if (!passwordEncoder.matches(formChangePassword.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.UNAUTHORIZED)
                            .code(401)
                            .data("Old password is incorrect")
                            .build()
            );
        }

        // Verify new password and confirm password match
        if (!formChangePassword.getNewPassword().equals(formChangePassword.getConfirmNewPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .code(400)
                            .data("New password and confirm password do not match")
                            .build()
            );
        }

        // Update password
        manageUserService.updatePassword(id, passwordEncoder.encode(formChangePassword.getNewPassword()));

        return ResponseEntity.status(HttpStatus.OK).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Password changed successfully")
                        .build()
        );
    }
}
