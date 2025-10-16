package com.srm.visionaid.service.impl;

import com.srm.visionaid.entity.ConversionRecord;
import com.srm.visionaid.repository.ConversionRecordRepository;
import com.srm.visionaid.service.BrailleConversionService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class BrailleConversionServiceImpl implements BrailleConversionService {

    private static final Map<Character, String> LETTERS = new HashMap<>();
    private static final Map<Character, String> PUNCT = new HashMap<>();
    private static final String SPACE = " ";
    private static final String CAPITAL = "⠠";
    private static final String NUMBER = "⠼";

    private final ConversionRecordRepository repo;

    public BrailleConversionServiceImpl(ConversionRecordRepository repo) {
        this.repo = repo;
    }

    static {
        // Letters a–z
        String[] brailleLetters = {
                "⠁","⠃","⠉","⠙","⠑","⠋","⠛","⠓","⠊","⠚",
                "⠅","⠇","⠍","⠝","⠕","⠏","⠟","⠗","⠎","⠞",
                "⠥","⠧","⠺","⠭","⠽","⠵"
        };
        for (int i = 0; i < 26; i++) {
            LETTERS.put((char)('a' + i), brailleLetters[i]);
        }

        // Punctuation
        PUNCT.put('.', "⠲");
        PUNCT.put(',', "⠂");
        PUNCT.put('?', "⠦");
        PUNCT.put('!', "⠖");
        PUNCT.put('-', "⠤");
        PUNCT.put(';', "⠆");
        PUNCT.put(':', "⠒");
        PUNCT.put('\'', "⠄");
        PUNCT.put('"', "⠶");
    }

    @Override
    public String convertToBraille(String input) {
        if (input == null || input.isBlank()) return "";

        StringBuilder result = new StringBuilder();
        boolean numberMode = false;

        for (char c : input.toCharArray()) {
            // Preserve newlines, skip carriage returns (handle Windows CRLF)
            if (c == '\r') {
                continue;
            }
            if (c == '\n') {
                result.append('\n');
                numberMode = false;
                continue;
            }

            if (Character.isWhitespace(c)) {
                // other whitespace (space, tab) -> braille SPACE marker
                result.append(SPACE);
                numberMode = false;
                continue;
            }

            if (Character.isDigit(c)) {
                if (!numberMode) {
                    result.append(NUMBER);
                    numberMode = true;
                }
                result.append(digitToBrailleLetter(c));
                continue;
            }

            numberMode = false;

            if (Character.isLetter(c)) {
                if (Character.isUpperCase(c)) result.append(CAPITAL);
                result.append(LETTERS.getOrDefault(Character.toLowerCase(c), "?"));
            } else {
                result.append(PUNCT.getOrDefault(c, "?"));
            }
        }

        String braille = result.toString();
        repo.save(ConversionRecord.of(input, braille));

        return braille;
    }

    private String digitToBrailleLetter(char digit) {
        return switch (digit) {
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
}

