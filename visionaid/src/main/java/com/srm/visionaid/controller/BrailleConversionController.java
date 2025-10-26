package com.srm.visionaid.controller;

import com.srm.visionaid.service.BrailleConversionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/braille")
public class BrailleConversionController {

    private final BrailleConversionService service;

    public BrailleConversionController(BrailleConversionService service) {
        this.service = service;
    }

    // Accepts plain text in the request body and returns the Braille string
    @PostMapping("/convert")
    public String convert(@RequestBody String text) {
        return service.convertToBraille(text);
    }

    // Returns JSON array of 6-dot patterns (array of arrays) for each character in the input
    @PostMapping("/dots")
    public List<int[]> convertToDots(@RequestBody String text) {
        return service.convertToDots(text);
    }
}
