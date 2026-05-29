package com.srm.visionaid.service;

import java.util.List;

public interface BrailleConversionService {
    String convertToBraille(String input);

    /**
     * Convert input text into a list of 6-dot patterns (one int[6] per character).
     * Each int is 0 or 1 indicating whether the dot is raised.
     */
    List<int[]> convertToDots(String input);
}
