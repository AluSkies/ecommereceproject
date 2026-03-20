package com.uade.tpo.demo.service;

public class PersonService {
    private com.uade.tpo.demo.repository.PersonRepository personRepository = new com.uade.tpo.demo.repository.PersonRepository();

    public java.util.ArrayList<com.uade.tpo.demo.entity.Person> getPeople() {
        return personRepository.getPeople();
    }

}
