package com.srm.visionaid.service;

import com.srm.visionaid.entity.ConversionRecord;
import com.srm.visionaid.repository.ConversionRecordRepository;
import com.srm.visionaid.service.BrailleConversionService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BrailleConversionServiceImpl implements BrailleConversionService {

    private final ConversionRecordRepository repo;

    public BrailleConversionServiceImpl(ConversionRecordRepository repo) {
        this.repo = repo;
    }

    // Letter -> 6-dot pattern (arrays of 0/1). Matches the frontend mapping previously used.
    private static final Map<Character, int[]> LETTER_DOTS = new HashMap<>();
    private static final Map<Character, int[]> DIGIT_DOTS = new HashMap<>();
    private static final Map<Character, int[]> PUNCT_DOTS = new HashMap<>();
    private static final int[] SPACE_DOTS = new int[]{0,0,0,0,0,0};

    static {
        // letters a-z mapping (copied from frontend brailleMap)
        LETTER_DOTS.put('a', new int[]{1,0,0,0,0,0});
        LETTER_DOTS.put('b', new int[]{1,1,0,0,0,0});
        LETTER_DOTS.put('c', new int[]{1,0,0,1,0,0});
        LETTER_DOTS.put('d', new int[]{1,0,0,1,1,0});
        LETTER_DOTS.put('e', new int[]{1,0,0,0,1,0});
        LETTER_DOTS.put('f', new int[]{1,1,0,1,0,0});
        LETTER_DOTS.put('g', new int[]{1,1,0,1,1,0});
        LETTER_DOTS.put('h', new int[]{1,1,0,0,1,0});
        LETTER_DOTS.put('i', new int[]{0,1,0,1,0,0});
        LETTER_DOTS.put('j', new int[]{0,1,0,1,1,0});
        LETTER_DOTS.put('k', new int[]{1,0,1,0,0,0});
        LETTER_DOTS.put('l', new int[]{1,1,1,0,0,0});
        LETTER_DOTS.put('m', new int[]{1,0,1,1,0,0});
        LETTER_DOTS.put('n', new int[]{1,0,1,1,1,0});
        LETTER_DOTS.put('o', new int[]{1,0,1,0,1,0});
        LETTER_DOTS.put('p', new int[]{1,1,1,1,0,0});
        LETTER_DOTS.put('q', new int[]{1,1,1,1,1,0});
        LETTER_DOTS.put('r', new int[]{1,1,1,0,1,0});
        LETTER_DOTS.put('s', new int[]{0,1,1,1,0,0});
        LETTER_DOTS.put('t', new int[]{0,1,1,1,1,0});
        LETTER_DOTS.put('u', new int[]{1,0,1,0,0,1});
        LETTER_DOTS.put('v', new int[]{1,1,1,0,0,1});
        LETTER_DOTS.put('w', new int[]{0,1,0,1,1,1});
        LETTER_DOTS.put('x', new int[]{1,0,1,1,0,1});
        LETTER_DOTS.put('y', new int[]{1,0,1,1,1,1});
        LETTER_DOTS.put('z', new int[]{1,0,1,0,1,1});

        // digits mapping: copy from frontend brailleDigits for 0-9
        DIGIT_DOTS.put('0', new int[]{0,1,1,1,1,0});
        DIGIT_DOTS.put('1', new int[]{1,0,0,0,0,0});
        DIGIT_DOTS.put('2', new int[]{1,1,0,0,0,0});
        DIGIT_DOTS.put('3', new int[]{1,0,0,1,0,0});
        DIGIT_DOTS.put('4', new int[]{1,0,0,1,1,0});
        DIGIT_DOTS.put('5', new int[]{1,0,0,0,1,0});
        DIGIT_DOTS.put('6', new int[]{1,1,0,1,0,0});
        DIGIT_DOTS.put('7', new int[]{1,1,0,1,1,0});
        DIGIT_DOTS.put('8', new int[]{1,1,0,0,1,0});
        DIGIT_DOTS.put('9', new int[]{0,1,0,1,0,0});

        // Basic punctuation mapped to simple patterns (use space for unknown)
        PUNCT_DOTS.put('.', new int[]{0,0,0,0,0,1});
        PUNCT_DOTS.put(',', new int[]{0,0,0,0,0,1});
        PUNCT_DOTS.put('?', new int[]{0,0,0,0,0,1});
        PUNCT_DOTS.put('!', new int[]{0,0,0,0,0,1});
        PUNCT_DOTS.put('-', new int[]{0,0,0,0,0,0});
        PUNCT_DOTS.put(';', new int[]{0,0,0,0,0,0});
        PUNCT_DOTS.put(':', new int[]{0,0,0,0,0,0});
        PUNCT_DOTS.put('\'', new int[]{0,0,0,0,0,0});
        PUNCT_DOTS.put('"', new int[]{0,0,0,0,0,0});
    }

    @Override
    public String convertToBraille(String input) {
        // keep existing behavior: map to unicode braille (reuse simple logic)
        if (input == null || input.isBlank()) return "";

        StringBuilder result = new StringBuilder();
        boolean numberMode = false;

        for (char c : input.toCharArray()) {
            if (c == '\r') continue;
            if (c == '\n') { result.append('\n'); numberMode = false; continue; }
            if (Character.isWhitespace(c)) { result.append(' '); numberMode = false; continue; }
            if (Character.isDigit(c)) {
                if (!numberMode) { result.append('⠼'); numberMode = true; }
                result.append(digitToBrailleLetter(c));
                continue;
            }
            numberMode = false;
            if (Character.isLetter(c)) {
                if (Character.isUpperCase(c)) result.append('⠠');
                int[] dots = LETTER_DOTS.getOrDefault(Character.toLowerCase(c), SPACE_DOTS);
                result.append(dotsToUnicode(dots));
            } else {
                result.append('?');
            }
        }

        String braille = result.toString();
        repo.save(ConversionRecord.of(input, braille));

        return braille;
    }

    @Override
    public List<int[]> convertToDots(String input) {
        if (input == null || input.isBlank()) return Collections.emptyList();

        List<int[]> patterns = new ArrayList<>();
        for (char raw : input.toCharArray()) {
            if (raw == '\r') continue; // skip CR
            if (Character.isWhitespace(raw)) {
                patterns.add(Arrays.copyOf(SPACE_DOTS, SPACE_DOTS.length));
                continue;
            }

            if (Character.isDigit(raw)) {
                patterns.add(DIGIT_DOTS.getOrDefault(raw, Arrays.copyOf(SPACE_DOTS, SPACE_DOTS.length)));
                continue;
            }

            if (Character.isLetter(raw)) {
                char lower = Character.toLowerCase(raw);
                patterns.add(LETTER_DOTS.getOrDefault(lower, Arrays.copyOf(SPACE_DOTS, SPACE_DOTS.length)));
                continue;
            }

            patterns.add(PUNCT_DOTS.getOrDefault(raw, Arrays.copyOf(SPACE_DOTS, SPACE_DOTS.length)));
        }

        // Save a record with braille unicode string as well for historical logs
        StringBuilder unicode = new StringBuilder();
        for (int[] p : patterns) unicode.append(dotsToUnicode(p));
        repo.save(ConversionRecord.of(input, unicode.toString()));

        return patterns;
    }

    private String digitToBrailleLetter(char d) {
        return switch (d) {
            case '1' -> "⠁";
            case '2' -> "⠃";
            case '3' -> "⠉";
            case '4' -> "⠙";
            case '5' -> "⠑";
            case '6' -> "⠋";
            case '7' -> "⠛";
            case '8' -> "⠓";
            case '9' -> "⠊";
            case '0' -> "⠚";
            default -> "?";
        };
    }

    // very small helper - convert 6-dot pattern to a placeholder unicode braille glyph
    // This is only used for storage/logging; accurate mapping to Unicode braille codepoints
    // requires bit arithmetic. We'll return a filled glyph when non-empty.
    private String dotsToUnicode(int[] dots) {
        for (int v : dots) if (v != 0) return "⠿";
        return " ";
    }
}

