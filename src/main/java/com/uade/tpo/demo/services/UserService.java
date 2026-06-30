package com.uade.tpo.demo.services;

import java.util.List;

import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.dto.UserResponse;
import com.uade.tpo.demo.entity.dto.UserUpdateRequest;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void disableUser(Long id);

    User getLoggedUser();

    UserResponse getLoggedUserResponse();
}
