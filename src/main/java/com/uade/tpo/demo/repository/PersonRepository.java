package com.uade.tpo.demo.repository;
import com.uade.tpo.demo.entity.Person;
import java.util.ArrayList;


public class PersonRepository {
    private ArrayList<Person> people = new ArrayList<>();
    
    public PersonRepository() {
        people.add(new Person(1, "Juan Perez", "juan.perez@example.com"));
        people.add(new Person(2, "Maria Rodriguez", "maria.rodriguez@example.com"));
    }

    public ArrayList<Person> getPeople() {
        return people;
    }
    
}
