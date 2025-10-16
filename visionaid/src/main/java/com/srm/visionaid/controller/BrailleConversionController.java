package com.srm.visionaid.controller;

import com.srm.visionaid.service.BrailleConversionService;
import org.springframework.web.bind.annotation.*;

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
}
