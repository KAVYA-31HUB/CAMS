package com.examly.springapp.controller;

import com.examly.springapp.entity.Programme;
import com.examly.springapp.service.ProgrammeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {

    @Autowired
    private ProgrammeService programmeService;

    @PostMapping
    public ResponseEntity<Programme> createProgramme(@Valid @RequestBody Programme programme) {
        return ResponseEntity.status(HttpStatus.CREATED).body(programmeService.createProgramme(programme));
    }

    @GetMapping
    public ResponseEntity<List<Programme>> getAllProgrammes() {
        return ResponseEntity.ok(programmeService.getAllProgrammes());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Programme>> getActiveProgrammes() {
        return ResponseEntity.ok(programmeService.getActiveProgrammes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Programme> getProgrammeById(@PathVariable Long id) {
        return ResponseEntity.ok(programmeService.getProgrammeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Programme> updateProgramme(@PathVariable Long id,
                                                       @Valid @RequestBody Programme programme) {
        return ResponseEntity.ok(programmeService.updateProgramme(id, programme));
    }

    // FR5: Configurable merit formula per programme
    @PutMapping("/{id}/merit-formula")
    public ResponseEntity<Programme> updateMeritFormula(@PathVariable Long id,
                                                        @RequestBody Map<String, String> payload) {
        String formula = payload.get("meritFormula");
        return ResponseEntity.ok(programmeService.updateMeritFormula(id, formula));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProgramme(@PathVariable Long id) {
        programmeService.deleteProgramme(id);
        return ResponseEntity.ok("Programme deleted successfully");
    }
}
