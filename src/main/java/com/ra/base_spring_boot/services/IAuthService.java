package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormLogin;
import com.ra.base_spring_boot.dto.req.FormRegister;
import com.ra.base_spring_boot.dto.resp.JwtResponse;

public interface IAuthService
{
    void register(FormRegister formRegister);
    JwtResponse login(FormLogin formLogin);
    void logout(String token);
    void banUser(String email);
}
