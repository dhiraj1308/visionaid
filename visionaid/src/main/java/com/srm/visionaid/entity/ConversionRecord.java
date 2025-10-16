package com.srm.visionaid.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversion_records")
public class ConversionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inputText;
    private String brailleText;
    private LocalDateTime createdAt;

    public static ConversionRecord of(String input, String braille) {
        ConversionRecord r = new ConversionRecord();
        r.inputText = input;
        r.brailleText = braille;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getInputText() {
        return inputText;
    }

    public String getBrailleText() {
        return brailleText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setInputText(String inputText) {
        this.inputText = inputText;
    }

    public void setBrailleText(String brailleText) {
        this.brailleText = brailleText;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

