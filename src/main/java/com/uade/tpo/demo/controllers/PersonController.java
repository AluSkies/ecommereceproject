package com.uade.tpo.demo.controllers;

import com.uade.tpo.demo.entity.Person;
import com.uade.tpo.demo.service.PersonService;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/people")

public class PersonController {
    private PersonService personService = new com.uade.tpo.demo.service.PersonService();

    @GetMapping("/list")
    public ArrayList<Person> getPeople() {
        return personService.getPeople();
    }

}
