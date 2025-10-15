package com.example.back.controllers;

import com.example.back.entities.Acte;
import com.example.back.repositories.RepoActe;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actes")
@CrossOrigin(origins = "http://localhost:4200") 
public class ActeController {

    private final RepoActe repoActe;

    public ActeController(RepoActe repoActe) {
        this.repoActe = repoActe;
    }

    @GetMapping
    public List<Acte> getAllActes() {
        return repoActe.findAll();
    }
}
