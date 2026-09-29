package com.stock.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stock.dto.DashboardResponse;
import com.stock.dto.LoginRequest;
import com.stock.dto.LoginResponse;
import com.stock.dto.ProfileResponse;
import com.stock.dto.SignupRequest;
import com.stock.entity.User;
import com.stock.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Signup
    public String signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists!";
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(request.getPassword());

        userRepository.save(user);

        return "Signup Successful";
    }

    // Login
    public LoginResponse login(LoginRequest request) {

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if (user.isEmpty()) {
            return new LoginResponse(null, null, null, null, "User Not Found");
        }

        if (!user.get().getPassword().equals(request.getPassword())) {
            return new LoginResponse(null, null, null, null, "Invalid Password");
        }

        User u = user.get();

        return new LoginResponse(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                "Login Successful"
        );
    }
    public ProfileResponse getProfile(Long id) {

        User user = userRepository.findById(id).orElse(null);

        if(user == null) {
            return null;
        }

        return new ProfileResponse(

                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber()

        );

    }
    public DashboardResponse getDashboard(Long id) {

        User user = userRepository.findById(id).orElse(null);

        if(user == null) {
            return null;
        }

        return new DashboardResponse(
                user.getFirstName(),
                user.getBalance(),
                0.0,
                0,
                0
        );

    }

}