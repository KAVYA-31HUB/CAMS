package com.examly.springapp.service;

import com.examly.springapp.entity.Programme;
import com.examly.springapp.entity.SeatMatrix;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.SeatMatrixRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatMatrixService {

    @Autowired
    private SeatMatrixRepository seatMatrixRepository;

    @Autowired
    private ProgrammeService programmeService;

    // FR6: configure how many seats a programme has for a quota, in a given round/year
    public SeatMatrix createSeatMatrix(Long programmeId, String quota, Integer totalSeats,
                                        Integer roundNo, String academicYear) {
        Programme programme = programmeService.getProgrammeById(programmeId);
        SeatMatrix seatMatrix = new SeatMatrix(programme, quota, totalSeats, roundNo, academicYear);
        return seatMatrixRepository.save(seatMatrix);
    }

    public List<SeatMatrix> getAllSeatMatrix() {
        return seatMatrixRepository.findAll();
    }

    public SeatMatrix getSeatMatrixById(Long id) {
        return seatMatrixRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat matrix row not found with id: " + id));
    }

    public void deleteSeatMatrix(Long id) {
        SeatMatrix existing = getSeatMatrixById(id);
        seatMatrixRepository.delete(existing);
    }
}
