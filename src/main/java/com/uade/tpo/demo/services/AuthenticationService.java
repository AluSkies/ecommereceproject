package com.uade.tpo.demo.services;

import com.uade.tpo.demo.entity.dto.AuthenticationRequest;
import com.uade.tpo.demo.entity.dto.AuthenticationResponse;
import com.uade.tpo.demo.entity.dto.UserRegisterRequest;

public interface AuthenticationService {

    AuthenticationResponse register(UserRegisterRequest request);

    AuthenticationResponse authenticate(AuthenticationRequest request);
}
