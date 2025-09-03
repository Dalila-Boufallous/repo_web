package com.example.back.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/entites")
public class EntiteControllerTest {

    @GetMapping("/test")
    public String test() {
        return "API fonctionne";
    }
}
