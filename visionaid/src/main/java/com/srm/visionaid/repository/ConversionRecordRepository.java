package com.srm.visionaid.repository;

import com.srm.visionaid.entity.ConversionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversionRecordRepository extends JpaRepository<ConversionRecord, Long> {
}
