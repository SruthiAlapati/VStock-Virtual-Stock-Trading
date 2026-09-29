package com.stock.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.stock.dto.DashboardResponse;
import com.stock.dto.LoginRequest;
import com.stock.dto.LoginResponse;
import com.stock.dto.ProfileResponse;
import com.stock.dto.SignupRequest;
import com.stock.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {

        return userService.signup(request);

    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        return userService.login(request);

    }
    
    @GetMapping("/profile/{id}")
    public ProfileResponse getProfile(@PathVariable Long id){
        return userService.getProfile(id);
    }

    @GetMapping("/dashboard/{id}")
    public DashboardResponse getDashboard(@PathVariable Long id){
        return userService.getDashboard(id);
    }

}